import { FilesAPI } from "@/api/files/api";
import { queryClient } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { RiFolderAddLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useFolderStructure } from "./hooks/use-folder-structure";

export const NewFolder = () => {
  const folderStructure = useFolderStructure();
  const [newFolderName, setNewFolderName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
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
      <Button disabled={isPending} onClick={() => setIsOpen(true)}>
        {isPending ? <Spinner /> : <RiFolderAddLine />}
        New Folder
      </Button>
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
