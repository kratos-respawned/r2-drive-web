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
import { useFileUpload } from "./hooks/use-file-upload";

export const EmptyFolder = () => {
  const { upload, isUploading } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      upload(files);
    }
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
        <Button variant="outline" onClick={handleUploadFile} disabled={isUploading}>
          <RiFileUploadLine />
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </EmptyContent>
    </Empty>
  );
};
