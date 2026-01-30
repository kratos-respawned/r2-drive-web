import { FilesAPI } from "@/api/files/api";
import { queryClient } from "@/App";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  RiFile2Fill,
  RiFileTextFill,
  RiImage2Fill,
  RiMusic2Fill,
  RiVideoFill,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  downloadFileFromFileId,
  FileType,
  openFileInNewTabFromFileId,
  type FileTypeEnum,
} from "./fs-utils";
import { useFolderStructure } from "./hooks/use-folder-structure";

export const GenericFile = ({
  name,
  id,
  path,
  type,
}: {
  path: string;
  name: string;
  id: number;
  type: FileTypeEnum;
}) => {
  const folderStructure = useFolderStructure();
  const url = path.replace(/^\/+|\/+$/g, "");

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const renameRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

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

  const openFolder = () => {
    if (isRenaming || deleteFile.isPending) {
      return;
    }
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
          onDoubleClick={openFolder}
          className={cn(
            "flex flex-col items-start  w-20  group  p-1",
            !isRenaming && "focus:ring ring-primary focus:bg-secondary hover:bg-muted",
          )}
        >
          {type === FileType.IMAGE && (
            <RiImage2Fill className={cn("w-16 h-16  ", deleteFile.isPending && "animate-pulse")} />
          )}
          {type === FileType.VIDEO && (
            <RiVideoFill className={cn("w-16 h-16  ", deleteFile.isPending && "animate-pulse")} />
          )}
          {type === FileType.AUDIO && (
            <RiMusic2Fill className={cn("w-16 h-16  ", deleteFile.isPending && "animate-pulse")} />
          )}
          {type === FileType.DOCUMENT && (
            <RiFileTextFill
              className={cn("w-16 h-16  ", deleteFile.isPending && "animate-pulse")}
            />
          )}
          {type === FileType.OTHER && (
            <RiFile2Fill className={cn("w-16 h-16  ", deleteFile.isPending && "animate-pulse")} />
          )}
          {isRenaming ? (
            <div ref={renameRef}>
              <Input
                ref={inputRef}
                className="h-6"
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
            <span className={cn("text-xs truncate ", renameFile.isPending && "animate-pulse")}>
              {name.length > 6 ? name.slice(0, 6) + "..." : name}
            </span>
          )}
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
