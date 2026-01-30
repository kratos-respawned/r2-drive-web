import { FilesAPI } from "@/api/files/api";

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
    switch (contentType) {
        case "image/*":
            return FileType.IMAGE;
        case "video/*":
            return FileType.VIDEO;
        case "audio/*":
            return FileType.AUDIO;
        case "application/*":
            return FileType.DOCUMENT;
        case "folder":
            return FileType.FOLDER;
        default:
            return FileType.OTHER;
    }
};

const getFileUrlFromFileKey = async (fileId: number) => {
    const fileUrl = await FilesAPI.getFileUrl(fileId);
    return fileUrl.url;
};

export const openFileInNewTabFromFileId = async (fileId: number) => {
    const fileUrl = await getFileUrlFromFileKey(fileId);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
};

export const downloadFileFromFileId = async (fileId: number, filename = new Date().toISOString()) => {
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