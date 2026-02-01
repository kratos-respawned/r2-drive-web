import { FilesAPI } from "@/api/files/api";
import { cn } from "@/lib/utils";
import {
  RiFile2Fill,
  RiFileTextFill,
  RiImage2Fill,
  RiMusic2Fill,
  RiVideoFill,
  type RemixiconComponentType,
} from "@remixicon/react";
import type { AxiosProgressEvent } from "axios";

export const FileType = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DOCUMENT: "document",
  OTHER: "other",
  FOLDER: "folder",
} as const;
export type FileTypeEnum = (typeof FileType)[keyof typeof FileType];

export const getFileType = (contentType: string): FileTypeEnum => {
  if (contentType.startsWith("image/")) return FileType.IMAGE;
  if (contentType.startsWith("video/")) return FileType.VIDEO;
  if (contentType.startsWith("audio/")) return FileType.AUDIO;
  if (contentType.startsWith("application/")) return FileType.DOCUMENT;
  if (contentType === "folder") return FileType.FOLDER;
  return FileType.OTHER;
};
const getFileUrlFromFileKey = async (fileId: number) => {
  const fileUrl = await FilesAPI.getFileUrl(fileId);
  return fileUrl.url;
};

export const FileIconFromFileType = ({
  fileType,
  className,
  ...props
}: {
  fileType: FileTypeEnum;
  className: string;
  props?: React.ComponentProps<RemixiconComponentType>;
}) => {
  switch (fileType) {
    case FileType.IMAGE:
      return <RiImage2Fill className={cn(className)} {...props} />;
    case FileType.VIDEO:
      return <RiVideoFill className={cn(className)} {...props} />;
    case FileType.AUDIO:
      return <RiMusic2Fill className={cn(className)} {...props} />;
    case FileType.DOCUMENT:
      return <RiFileTextFill className={cn(className)} {...props} />;
    case FileType.OTHER:
      return <RiFile2Fill className={cn(className)} {...props} />;
    default:
      return <></>;
  }
};

export const openFileInNewTabFromFileId = async (fileId: number) => {
  const fileUrl = await getFileUrlFromFileKey(fileId);
  window.open(fileUrl, "_blank", "noopener,noreferrer");
};
export const openFileFromFileId = async (fileId: number) => {
  const fileUrl = await getFileUrlFromFileKey(fileId);
  window.location.href = fileUrl;
};
export const downloadFileFromFileId = async (
  fileId: number,
  filename = new Date().toISOString(),
) => {
  const fileUrl = await getFileUrlFromFileKey(fileId);
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
};

export const calculateUploadProgress = (progress: AxiosProgressEvent) => {
  return Math.round((progress.loaded / (progress.total ?? 1)) * 100);
};

export const getFileSize = (sizeInKB: number) => {
  const size = sizeInKB * 1024;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const getFileSizeInKB = (sizeInKB: number) => {
  return sizeInKB / 1024;
};
