import { API_BASE_URL } from "./axios";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_INTERMEDIATE_SIZE = 1024; // resize large images to this first

export async function createCoverWebpThumbnail(
    file: File,
    size = 300,
    quality = 0.8
): Promise<File | null> {
    if (!file.type.startsWith("image/")) {
        return null;
    }
    if (file.size > MAX_FILE_SIZE) return null;

    const probeBitmap = await createImageBitmap(file);
    const { width: origW, height: origH } = probeBitmap;
    probeBitmap.close();

    const maxDim = Math.max(origW, origH);
    const needsDownscale = maxDim > MAX_INTERMEDIATE_SIZE;

    const bitmap = await createImageBitmap(
        file,
        needsDownscale
            ? {
                resizeWidth:
                    origW >= origH
                        ? MAX_INTERMEDIATE_SIZE
                        : Math.round((origW / origH) * MAX_INTERMEDIATE_SIZE),
                resizeHeight:
                    origH >= origW
                        ? MAX_INTERMEDIATE_SIZE
                        : Math.round((origH / origW) * MAX_INTERMEDIATE_SIZE),
                resizeQuality: "high",
            }
            : undefined
    );

    const canvas =
        "OffscreenCanvas" in window
            ? new OffscreenCanvas(size, size)
            : Object.assign(document.createElement("canvas"), {
                width: size,
                height: size,
            });

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");

    const scale = Math.max(size / bitmap.width, size / bitmap.height);
    const sw = size / scale;
    const sh = size / scale;
    const sx = (bitmap.width - sw) / 2;
    const sy = (bitmap.height - sh) / 2;

    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, size, size);
    bitmap.close();

    const blob: Blob | null =
        canvas instanceof OffscreenCanvas
            ? await canvas.convertToBlob({ type: "image/webp", quality })
            : await new Promise<Blob | null>((resolve) =>
                (canvas as HTMLCanvasElement).toBlob(
                    (b) =>
                        b
                            ? resolve(b)
                            : resolve(null),
                    "image/webp",
                    quality
                )
            );
    if (!blob) return null;
    return new File([blob], replaceExt(file.name, "webp"), {
        type: "image/webp",
    });
}

function replaceExt(name: string, ext: string) {
    return name.replace(/\.[^.]+$/, "") + "." + ext;
}

/**
 * Returns the thumbnail API endpoint URL. Use as <img src={...}>.
 * The server responds with 302 to the actual image URL; the browser follows the redirect.
 */
export const getThumbnailUrl = (thumbnail: string): string => {
    // return thumbnail;
    return `${API_BASE_URL}/api/files/${encodeURIComponent(thumbnail)}/thumbnail`;
};
