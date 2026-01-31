import { FilesAPI } from "@/api/files/api";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/query";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  downloadFileFromFileId,
  getFileIconFromFileType,
  getFileSize,
  openFileFromFileId,
  openFileInNewTabFromFileId,
  type FileTypeEnum,
} from "./fs-utils";
import { useFolderStructure } from "./hooks/use-folder-structure";

export const GenericFile = ({
  name,
  id,
  type,
  sizeInKB,
}: {
  name: string;
  id: number;
  type: FileTypeEnum;
  sizeInKB: number;
}) => {
  const folderStructure = useFolderStructure();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const renameRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const deleteFile = useMutation({
    mutationFn: async () => {
      await FilesAPI.deleteFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(folderStructure) });
    },
  });
  const renameFile = useMutation({
    mutationFn: async () => {
      await FilesAPI.updateFile({ id, name: newName.trim(), parentPath: folderStructure });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(folderStructure) });
    },
  });

  const openFile = () => {
    if (isRenaming || deleteFile.isPending) {
      return;
    }
    openFileFromFileId(id);
  };

  useEffect(() => {
    if (!isRenaming) return;

    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    const handleClickOutside = (event: MouseEvent) => {
      if (renameRef.current && !renameRef.current.contains(event.target as Node)) {
        setNewName(name);
        setIsRenaming(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRenaming]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          tabIndex={isRenaming ? undefined : 1}
          className={cn(
            "group relative aspect-square border border-black dark:border-white p-4 flex flex-col justify-between bg-white dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-all cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1",
          )}
        >
          <div className="flex justify-center items-center grow">
            {getFileIconFromFileType(type, {
              className: cn(
                " text-primary drop-shadow-md size-20 ",
                deleteFile.isPending ? "animate-pulse" : "",
              ),
            })}
          </div>
          <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3 group-hover:border-black/10 dark:group-hover:border-white/10">
            {isRenaming ? (
              <div ref={renameRef} className="max-w-[130px] h-[15px]">
                <Input
                  ref={inputRef}
                  className=" w-full px-0 py-0 max-h-[15px] block"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    console.log(e.key);
                    if (e.key === "Enter" || e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      renameFile.mutate();
                      setIsRenaming(false);
                    }
                  }}
                />
              </div>
            ) : (
              <p className="text-xs truncate font-bold" title="Design Assets">
                {name.length > 15 ? name.slice(0, 15) + "..." : name}
              </p>
            )}
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">
              {getFileSize(sizeInKB)} • {type}
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => openFileInNewTabFromFileId(id)}>Open</ContextMenuItem>
        <ContextMenuItem onClick={() => downloadFileFromFileId(id, name)}>Download</ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            setIsRenaming(true);
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => deleteFile.mutate()}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
