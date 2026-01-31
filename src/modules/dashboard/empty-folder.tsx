import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { RiFileUploadLine, RiFolder3Fill } from "@remixicon/react";
import { useRef } from "react";

import { useMachine } from "@xstate/react";
import { useFolderStructure } from "./hooks/use-folder-structure";
import { uploadManagerMachine } from "./store/upload-manager.machine";

export const EmptyFolder = () => {
  const folderStructure = useFolderStructure();
  const [, send] = useMachine(uploadManagerMachine);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = () => {
    fileInputRef.current?.click();
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

  return (
    <Empty className="min-h-[80svh]">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary">
          <RiFolder3Fill className="text-primary-foreground" />
        </EmptyMedia>
        <EmptyTitle>Nothing to see here</EmptyTitle>
        <EmptyDescription>
          No files in this folder. Get started by uploading your first file.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
        <Button variant="outline" onClick={handleUploadFile}>
          <RiFileUploadLine />
          Upload File
        </Button>
      </EmptyContent>
    </Empty>
  );
};
