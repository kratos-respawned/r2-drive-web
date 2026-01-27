import { useState, useCallback } from "react";
import { toast } from "sonner";
import { queryClient } from "@/App";
import { FilesAPI } from "@/api/files/api";
import {
  uploadFiles,
  type BatchUploadProgress,
  type FileUploadProgress,
} from "../file-utils";
import { useFolderStructure } from "./use-folder-structure";

interface UseFileUploadOptions {
  onComplete?: (progress: BatchUploadProgress) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = (options?: UseFileUploadOptions) => {
  const parentPath = useFolderStructure();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<BatchUploadProgress | null>(null);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (fileArray.length === 0) {
        return;
      }

      setIsUploading(true);
      setProgress(null);

      const toastId = toast.loading(
        `Uploading ${fileArray.length} ${fileArray.length === 1 ? "file" : "files"}...`,
        {
          description: "Preparing upload...",
        }
      );

      try {
        const result = await uploadFiles(fileArray, parentPath, (batchProgress) => {
          setProgress(batchProgress);

          // Update toast with progress
          const currentFile = batchProgress.files.find(
            (f) => f.status === "uploading" || f.status === "creating-record"
          );
          const statusText = getProgressStatusText(batchProgress, currentFile);

          toast.loading(statusText.title, {
            id: toastId,
            description: statusText.description,
          });
        });

        // Show final result
        if (result.failedFiles === 0) {
          toast.success(
            `Successfully uploaded ${result.completedFiles} ${result.completedFiles === 1 ? "file" : "files"}`,
            { id: toastId }
          );
        } else if (result.completedFiles === 0) {
          toast.error(`Failed to upload ${result.failedFiles} ${result.failedFiles === 1 ? "file" : "files"}`, {
            id: toastId,
            description: result.files.find((f) => f.error)?.error,
          });
        } else {
          toast.warning(
            `Uploaded ${result.completedFiles} of ${result.totalFiles} files`,
            {
              id: toastId,
              description: `${result.failedFiles} ${result.failedFiles === 1 ? "file" : "files"} failed`,
            }
          );
        }

        // Invalidate the file list query to refresh the UI
        queryClient.invalidateQueries({
          queryKey: FilesAPI.listFiles.key(parentPath),
        });

        options?.onComplete?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed");
        toast.error("Upload failed", {
          id: toastId,
          description: err.message,
        });
        options?.onError?.(err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [parentPath, options]
  );

  const reset = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    reset,
  };
};

function getProgressStatusText(
  progress: BatchUploadProgress,
  currentFile?: FileUploadProgress
): { title: string; description: string } {
  const { completedFiles, totalFiles, overallProgress } = progress;

  if (!currentFile) {
    return {
      title: `Uploading ${totalFiles} ${totalFiles === 1 ? "file" : "files"}...`,
      description: `${overallProgress}% complete`,
    };
  }

  const fileName =
    currentFile.file.name.length > 30
      ? currentFile.file.name.slice(0, 27) + "..."
      : currentFile.file.name;

  const statusMap: Record<FileUploadProgress["status"], string> = {
    pending: "Waiting...",
    "getting-url": "Preparing...",
    uploading: `${currentFile.progress}%`,
    "creating-record": "Finalizing...",
    completed: "Done",
    error: "Failed",
  };

  return {
    title: `Uploading (${completedFiles + 1}/${totalFiles})`,
    description: `${fileName} - ${statusMap[currentFile.status]}`,
  };
}
