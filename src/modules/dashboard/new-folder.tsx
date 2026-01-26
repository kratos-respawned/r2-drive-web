import { FilesAPI } from "@/api/files/api";
import { queryClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RiFolderAddLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFolderStructure } from "./hooks/use-folder-structure";

export const NewFolder = () => {
  const folderStructure = useFolderStructure();
  const { mutate: createFolder, isPending } = useMutation({
    mutationFn: async () => {
      await FilesAPI.createFolder({
        name: "New Folder",
        parentPath: folderStructure,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(folderStructure) });
    },
  });
  return (
    <Button disabled={isPending} onClick={() => createFolder()}>
      {isPending ? <Spinner /> : <RiFolderAddLine />}
      New Folder
    </Button>
  );
};
