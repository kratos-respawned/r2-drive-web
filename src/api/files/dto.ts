/**
 * Type definitions for Files API
 * Can be imported separately for type-only usage
 */

/**
 * File/Folder object returned from the API
 */
export interface FileObject {
  id: number;
  name: string;
  path: string;
  size: number;
  thumbnail: string | null;
  contentType: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Response from listFiles endpoint
 */
export interface ListFilesResponse {
  currentPath: string;
  parentPath: string | null;
  items: FileObject[];
}

/**
 * Request payload for getting an upload URL
 */
export interface GetUploadUrlRequest {
  name: string;
  contentType: string;
  size: number;
  parentPath?: string;
}

/**
 * Response from getUploadUrl endpoint
 */
export interface GetUploadUrlResponse {
  url: string;
  key: string;
}

/**
 * Request payload for creating a file record
 */
export interface CreateFileRequest {
  key: string;
  name: string;
  contentType: string;
  size: number;
  parentPath?: string;
  thumbnail?: string | null;
}

/**
 * Request payload for updating a file/folder
 */
export interface UpdateFileRequest {
  id: number;
  name: string;
  parentPath: string;
}

/**
 * Request payload for creating a folder
 */
export interface CreateFolderRequest {
  name: string;
  parentPath: string;
}

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
}

/**
 * Success response for delete/update operations
 */
export interface SuccessResponse {
  message: string;
}

export interface GetFileUrlResponse {
  url: string;
}

