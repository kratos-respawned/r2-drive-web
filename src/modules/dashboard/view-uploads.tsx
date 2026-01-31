import { FilesAPI } from "@/api/files/api";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/lib/query";
import {
  RiArrowDownSFill,
  RiFileUploadLine,
  RiFolderAddLine,
  RiUploadCloudFill,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";

import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { useMachine } from "@xstate/react";
import { useFolderStructure } from "./hooks/use-folder-structure";
import { uploadManagerMachine } from "./store/upload-manager.machine";

export const NewFolder = () => {
  const folderStructure = useFolderStructure();
  const [, send] = useMachine(uploadManagerMachine);

  const [newFolderName, setNewFolderName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFolderUpload = () => {
    folderInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    send({
      type: "FILES_SELECTED",
      files: Array.from(fileList),
      parentPath: folderStructure,
    });
    event.target.value = "";
  };

  const { mutate: createFolder, isPending } = useMutation({
    mutationFn: async () => {
      await FilesAPI.createFolder({
        name: newFolderName.trim(),
        parentPath: folderStructure,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(folderStructure) });
      setIsOpen(false);
      setNewFolderName("");
    },
  });
  return (
    <>
      <ButtonGroup>
        <Button className="pl-2!" asChild>
          <Link to="/dashboard/uploads">
            <RiUploadCloudFill />
            View Uploads
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="pl-2!">
              <RiArrowDownSFill />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              <RiFolderAddLine />
              New Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleFileUpload}>
              <RiFileUploadLine />
              File Upload
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleFolderUpload}>
              <RiFolderAddLine />
              Folder Upload
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileChange}
        // @ts-expect-error webkitdirectory is not in the type definitions
        webkitdirectory=""
        className="hidden"
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              createFolder();
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>Create a new folder in the current directory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  name="folder-name"
                  defaultValue="New folder"
                  value={newFolderName}
                  maxLength={25}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    Creating folder...
                  </>
                ) : (
                  <>Create Folder</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
