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
import { RiFolder3Fill } from "@remixicon/react";
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
  const renameFolder = useMutation({
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
            "w-[164px] h-[173px] group relative aspect-square border border-black dark:border-white p-4 flex flex-col justify-between bg-white dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-all cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1",
          )}
        >
          <div className="flex justify-center items-center grow">
            <RiFolder3Fill
              className={cn(
                " text-primary drop-shadow-md size-20 ",
                renameFolder.isPending ? "animate-pulse" : "",
              )}
            />
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
                      renameFolder.mutate();
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
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">12 files</p>
          </div>
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
