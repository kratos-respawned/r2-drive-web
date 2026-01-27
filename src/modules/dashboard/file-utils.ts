import { FilesAPI } from "@/api/files/api";
import type { FileObject, GetUploadUrlResponse } from "@/api/files/dto";
import type { AxiosProgressEvent } from "axios";

export interface FileUploadProgress {
    file: File;
    status: "pending" | "getting-url" | "uploading" | "creating-record" | "completed" | "error";
    progress: number; // 0-100
    error?: string;
    result?: FileObject;
}

export interface BatchUploadProgress {
    files: FileUploadProgress[];
    totalFiles: number;
    completedFiles: number;
    failedFiles: number;
    overallProgress: number; // 0-100
}

export type UploadProgressCallback = (progress: BatchUploadProgress) => void;

interface FileWithUploadUrl {
    file: File;
    uploadUrl: GetUploadUrlResponse | null;
    error?: string;
}

/**
 * Upload multiple files sequentially
 * Gets upload URLs for all files in parallel, then uploads one by one
 */
export async function uploadFiles(
    files: File[],
    parentPath: string,
    onProgress?: UploadProgressCallback
): Promise<BatchUploadProgress> {
    const progress: BatchUploadProgress = {
        files: files.map((file) => ({
            file,
            status: "pending",
            progress: 0,
        })),
        totalFiles: files.length,
        completedFiles: 0,
        failedFiles: 0,
        overallProgress: 0,
    };

    const notifyProgress = () => {
        // Calculate overall progress
        const totalProgress = progress.files.reduce((sum, f) => sum + f.progress, 0);
        progress.overallProgress = Math.round(totalProgress / progress.totalFiles);
        onProgress?.({ ...progress, files: [...progress.files] });
    };

    // Step 1: Get upload URLs for all files in parallel
    progress.files.forEach((f) => (f.status = "getting-url"));
    notifyProgress();

    const filesWithUrls: FileWithUploadUrl[] = await Promise.all(
        files.map(async (file) => {
            try {
                const uploadUrl = await FilesAPI.getUploadUrl({
                    name: file.name,
                    contentType: file.type || "application/octet-stream",
                    size: file.size,
                    parentPath,
                });
                return { file, uploadUrl };
            } catch (error) {
                return {
                    file,
                    uploadUrl: null,
                    error: error instanceof Error ? error.message : "Failed to get upload URL",
                };
            }
        })
    );

    // Update progress for files that failed to get URLs
    filesWithUrls.forEach((f, index) => {
        if (f.error) {
            progress.files[index].status = "error";
            progress.files[index].error = f.error;
            progress.failedFiles++;
        }
    });
    notifyProgress();

    // Step 2: Upload files sequentially
    for (let i = 0; i < filesWithUrls.length; i++) {
        const { file, uploadUrl, error } = filesWithUrls[i];
        const fileProgress = progress.files[i];

        // Skip files that failed to get URLs
        if (error || !uploadUrl) {
            continue;
        }

        try {
            // Upload to R2 using presigned URL
            // The key is embedded in the presigned URL - R2 stores the file at that key
            // regardless of the File.name property, so we use the original file directly
            fileProgress.status = "uploading";
            notifyProgress();

            await FilesAPI.uploadFile(uploadUrl.url, file, (event: AxiosProgressEvent) => {
                if (event.total) {
                    // Upload is 80% of the work, getting URL was ~10%, creating record is ~10%
                    fileProgress.progress = 10 + Math.round((event.loaded / event.total) * 80);
                    notifyProgress();
                }
            });

            fileProgress.status = "creating-record";
            fileProgress.progress = 90;
            notifyProgress();

            const result = await FilesAPI.createFile({
                key: uploadUrl.key,
                name: file.name,
                contentType: file.type || "application/octet-stream",
                size: file.size,
                parentPath,
            });

            fileProgress.status = "completed";
            fileProgress.progress = 100;
            fileProgress.result = result;
            progress.completedFiles++;
            notifyProgress();
        } catch (error) {
            fileProgress.status = "error";
            fileProgress.error = error instanceof Error ? error.message : "Upload failed";
            fileProgress.progress = 0;
            progress.failedFiles++;
            notifyProgress();
        }
    }

    return progress;
}

/**
 * Upload a single file
 * Convenience wrapper around uploadFiles for single file upload
 */
export async function uploadFile(
    file: File,
    parentPath: string,
    onProgress?: (progress: FileUploadProgress) => void
): Promise<FileUploadProgress> {
    const result = await uploadFiles([file], parentPath, (batchProgress) => {
        onProgress?.(batchProgress.files[0]);
    });
    return result.files[0];
}
