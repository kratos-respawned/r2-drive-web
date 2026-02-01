/**
 * Files API Contract for Frontend
 *
 * This file provides a type-safe API client for interacting with the R2 Drive API.
 * All methods are static and can be used directly without instantiation.
 *
 * Usage:
 * ```ts
 * import { setBaseUrl } from './api/client';
 * import { FilesAPI } from './api/files/api';
 *
 * setBaseUrl('https://your-worker.workers.dev');
 * const files = await FilesAPI.listFiles('/path/to/folder');
 * const uploadUrl = await FilesAPI.getUploadUrl({ name: 'file.pdf', contentType: 'application/pdf', size: 1024 });
 * ```
 */

import type { AxiosProgressEvent } from "axios";
import apiClient from "../../lib/axios";
import type {
  CreateFileRequest,
  CreateFolderRequest,
  FileObject,
  GetFileUrlResponse,
  GetUploadUrlRequest,
  GetUploadUrlResponse,
  ListFilesResponse,
  SuccessResponse,
  UpdateFileRequest
} from "./dto";

export type UploadProgressCallback = (progress: AxiosProgressEvent) => void;

export class FilesAPI {
  /**
   * List files and folders in a directory
   * @param path - The directory path (empty string for root)
   * @returns Promise resolving to the list of files and folder info
   */
  public static listFiles = {
    key: (path: string) => ["list-files", path],
    fn: async (path: string): Promise<ListFilesResponse> => {
      const response = await apiClient.get<ListFilesResponse>("/api/files", {
        params: path ? { path } : undefined,
      });
      return response.data;
    },
  };

  /**
   * Get a presigned URL for uploading a file to R2
   * @param request - Upload URL request parameters
   * @param signal - Optional abort signal
   * @returns Promise resolving to the presigned URL and key
   */
  static async getUploadUrl(
    request: GetUploadUrlRequest,
    signal?: AbortSignal,
  ): Promise<GetUploadUrlResponse> {
    const response = await apiClient.post<GetUploadUrlResponse>(
      "/api/files/upload-url",
      {
        name: request.name,
        contentType: request.contentType,
        size: request.size,
        parentPath: request.parentPath ?? "",
        thumbnail: request.thumbnail
      },
      signal ? { signal: signal } : undefined,
    );
    return response.data;
  }

  /**
   * Upload a file to R2 using the presigned URL
   * @param uploadUrl - The presigned URL from getUploadUrl
   * @param file - The File object to upload
   * @param onUploadProgress - Optional callback for upload progress
   * @param signal - Optional abort signal
   * @returns Promise resolving when upload is complete
   */
  static async uploadFile(
    uploadUrl: string,
    file: File,
    onUploadProgress?: UploadProgressCallback,
    signal?: AbortSignal,
  ): Promise<void> {
    await apiClient.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      withCredentials: false,
      onUploadProgress,
      ...(signal ? { signal: signal } : undefined),
    });
  }

  /**
   * Create a file record in the database after successful upload
   * @param request - File creation request parameters
   * @returns Promise resolving to the created file object
   */
  static async createFile(request: CreateFileRequest, signal?: AbortSignal): Promise<FileObject> {
    const response = await apiClient.post<FileObject>(
      "/api/files",
      {
        key: request.key,
        name: request.name,
        contentType: request.contentType,
        size: request.size,
        parentPath: request.parentPath ?? "",
      },
      signal ? { signal: signal } : undefined,
    );
    return response.data;
  }

  /**
   * Complete file upload flow: get URL, upload to R2, create record
   * @param file - The File object to upload
   * @param parentPath - Optional parent directory path
   * @param thumbnail - Optional thumbnail URL
   * @param onUploadProgress - Optional callback for upload progress
   * @returns Promise resolving to the created file object
   */
  static async uploadFileComplete(
    file: File,
    parentPath?: string,
    thumbnail?: File | null,
    onUploadProgress?: UploadProgressCallback,
    signal?: AbortSignal,
  ): Promise<FileObject> {
    // Step 1: Get presigned URL
    const { url, key, thumbnailUrl } = await this.getUploadUrl(
      {
        name: file.name,
        contentType: file.type,
        size: file.size,
        parentPath,
        thumbnail: thumbnail ? {
          size: thumbnail.size,
          contentType: thumbnail.type,
        } : null,
      },
      signal,
    );
    // Step 2: Upload to R2
    if (thumbnailUrl && thumbnail) {
      await this.uploadFile(thumbnailUrl, thumbnail, undefined, signal);
    }
    await this.uploadFile(url, file, onUploadProgress, signal);
    // Step 3: Create file record
    return this.createFile(
      {
        key,
        name: file.name,
        contentType: file.type,
        size: file.size,
        parentPath,
      },
      signal,
    );
  }

  /**
   * Delete a file or folder
   * @param id - The file/folder ID
   * @returns Promise resolving to success message
   */
  static async deleteFile(id: number): Promise<SuccessResponse> {
    const response = await apiClient.delete<SuccessResponse>(`/api/files/${id}`);
    return response.data;
  }

  /**
   * Update a file or folder (rename/move)
   * @param request - Update request parameters
   * @returns Promise resolving to success message
   */
  static async updateFile(request: UpdateFileRequest): Promise<SuccessResponse> {
    const response = await apiClient.put<SuccessResponse>(`/api/files/${request.id}`, {
      id: request.id,
      name: request.name,
      parentPath: request.parentPath,
    });
    return response.data;
  }

  /**
   *
   * @param id The file ID
   * @returns Promise resolving to the file URL
   */
  static async getFileUrl(id: number): Promise<GetFileUrlResponse> {
    const response = await apiClient.get<GetFileUrlResponse>(`/api/files/${id}`);
    return response.data;
  }

  /**
   * Create a new folder
   * @param request - Folder creation request parameters
   * @returns Promise resolving to the created folder object
   */
  static async createFolder(request: CreateFolderRequest): Promise<FileObject> {
    const response = await apiClient.post<FileObject>("/api/files/folder", {
      name: request.name,
      parentPath: request.parentPath,
    });
    return response.data;
  }

}
