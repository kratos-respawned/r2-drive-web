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
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useFolderStructure } from "./hooks/use-folder-structure";

export const Folder = ({ name, id, path }: { path: string; name: string; id: number }) => {
  const folderStructure = useFolderStructure();
  const url = path.replace(/^\/+|\/+$/g, "");

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const renameRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

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

  const openFolder = () => {
    if (isRenaming || deleteFolder.isPending) {
      return;
    }
    navigate({
      to: "/dashboard/$",
      params: { _splat: url },
    });
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
          <RiFolder2Fill className={cn("w-16 h-16 ", deleteFolder.isPending && "animate-pulse")} />
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
                    updateFile.mutate();
                    setIsRenaming(false);
                  }
                }}
              />
            </div>
          ) : (
            <span className={cn("text-xs truncate ", updateFile.isPending && "animate-pulse")}>
              {name.length > 6 ? name.slice(0, 6) + "..." : name}
            </span>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem asChild>
          <Link to="/dashboard/$" params={{ _splat: url }}>
            Open
          </Link>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            setIsRenaming(true);
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => deleteFolder.mutate()}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
