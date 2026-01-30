import { FilesAPI, type UploadProgressCallback } from "@/api/files/api";
import type { FileObject } from "@/api/files/dto";
import { queryClient } from "@/App";
import { AxiosError } from "axios";
import { useCallback, useRef, useState } from "react";

interface UseFileUploadOptions {
  parentPath: string;
  thumbnail?: string | null;
  onSuccess?: (file: FileObject) => void;
  onError?: (error: string) => void;
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<FileObject | null>;
  isUploading: boolean;
  error: string | null;
  progress: number;
  reset: () => void;
}

export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const { parentPath, thumbnail, onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const cancelTokenSource = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setError(null);
    setProgress(0);

    cancelTokenSource.current?.abort();
  }, []);

  const upload = useCallback(
    async (file: File): Promise<FileObject | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const onUploadProgress: UploadProgressCallback = (event) => {
        const percent = Math.round((event.loaded / (event.total ?? 1)) * 100);
        setProgress(percent);
      };

      cancelTokenSource.current = new AbortController();
      const { signal } = cancelTokenSource.current;
      try {
        const result = await FilesAPI.uploadFileComplete(
          file,
          parentPath,
          thumbnail,
          onUploadProgress,
          signal,
        );
        setIsUploading(false);
        setProgress(100);
        queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(parentPath) });
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error =
          err instanceof AxiosError
            ? (err.response?.data.error as string)
            : err instanceof Error
              ? err.message
              : "Something went wrong";
        setError(error);
        setIsUploading(false);
        onError?.(error);
        return null;
      }
    },
    [parentPath, thumbnail, onSuccess, onError],
  );

  return { upload, isUploading, error, progress, reset };
}
