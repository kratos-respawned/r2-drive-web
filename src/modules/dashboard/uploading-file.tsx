import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { GridProgress } from "@/components/ui/grid-progress";
import { cn } from "@/lib/utils";
import { RiRestartLine } from "@remixicon/react";
import { FileIconFromFileType, getFileType } from "./fs-utils";
import { useFolderStructure } from "./hooks/use-folder-structure";
import { useUploadItemActor } from "./hooks/use-upload-item-actor";
import type { UploadActorRef } from "./store/upload-store";

export const UploadingFile = ({ actor }: { actor: UploadActorRef }) => {
  const upload = useUploadItemActor(actor);
  const path = useFolderStructure();
  if (upload.isSuccess || upload.parentPath !== path) return null;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={() => upload.send({ type: "RETRY" })}
          className={cn(
            "group w-[164px]  h-[173px] relative aspect-square border border-black dark:border-white p-4 flex flex-col justify-between bg-white dark:bg-zinc-900 hover:bg-primary/10 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            upload.isError && "opacity-50 hover:bg-destructive/10",
          )}
        >
          <div className="flex justify-center items-center grow flex-col gap-2 ">
            {upload.isError ? (
              <RiRestartLine className="size-16" />
            ) : (
              <FileIconFromFileType
                fileType={getFileType(upload.contentType)}
                className={cn("drop-shadow-md size-16 animate-pulse")}
              />
            )}

            <GridProgress
              progress={upload.isError ? 25 : upload.progress}
              count={10}
              className={upload.isError ? "data-[active=true]:bg-destructive" : ""}
            />
          </div>
          <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3 group-hover:border-black/10 dark:group-hover:border-white/10">
            <p
              className={cn(
                "text-xs truncate font-bold text-primary",
                upload.isError && "text-destructive",
              )}
            >
              {upload.isUploading
                ? "Uploading..."
                : upload.isSuccess
                  ? "Uploaded"
                  : upload.isError
                    ? "Error"
                    : "Pending"}
              {upload.isError && ": " + upload.error}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">
              {upload.name.length > 15 ? upload.name.slice(0, 15) + "..." : upload.name}
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => upload.send({ type: "CANCEL" })}>Cancel</ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => upload.deleteFile()}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
