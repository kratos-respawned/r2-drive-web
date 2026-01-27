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
import { RiFolder2Fill } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useFolderStructure } from "./hooks/use-folder-structure";

export const Folder = ({
  name,
  id,
  parentPath,
  path,
}: {
  parentPath: string;
  path: string;
  name: string;
  id: number;
}) => {
  const folderStructure = useFolderStructure();
  const url = path.replace(/^\/+|\/+$/g, "");

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const renameRef = useRef<HTMLDivElement | null>(null);
  const deleteFolder = useMutation({
    mutationFn: async () => {
      await FilesAPI.deleteFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(folderStructure) });
    },
  });
  const updateFile = useMutation({
    mutationFn: async () => {
      await FilesAPI.updateFile({ id, name: newName.trim(), parentPath: folderStructure });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(folderStructure) });
    },
  });

  useEffect(() => {
    if (!isRenaming) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (renameRef.current && !renameRef.current.contains(event.target as Node)) {
        setIsRenaming(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRenaming]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          to="/dashboard/$"
          onClick={(e) => {
            if (isRenaming || deleteFolder.isPending) {
              e.preventDefault();
              return;
            }
          }}
          params={{ _splat: url }}
          className="flex flex-col items-start  w-fit"
        >
          <RiFolder2Fill className={cn("w-16 h-16", deleteFolder.isPending && "animate-pulse")} />
          {isRenaming ? (
            <div ref={renameRef}>
              <Input
                className="h-6"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    updateFile.mutate();
                    setIsRenaming(false);
                  }
                }}
              />
            </div>
          ) : (
            <span className={cn("text-sm", updateFile.isPending && "animate-pulse")}>{name}</span>
          )}
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem asChild>
          <Link to="/dashboard/$" params={{ _splat: url }}>
            Open
          </Link>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setIsRenaming(true)}>Rename</ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => deleteFolder.mutate()}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
