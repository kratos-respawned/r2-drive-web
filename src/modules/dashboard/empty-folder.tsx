import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { RiFileUploadLine, RiFolder3Fill } from "@remixicon/react";
import { useRef } from "react";
import { toast } from "sonner";
import { useFileUpload } from "./hooks/use-file-upload";
import { useFolderStructure } from "./hooks/use-folder-structure";

export const EmptyFolder = () => {
  const folderStructure = useFolderStructure();
  const { upload, isUploading, progress, reset } = useFileUpload({
    parentPath: folderStructure,
    onError: (error) => {
      toast.error(error);
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files?.[0];
    if (!file) return;
    toast.promise(() => upload(file), {
      loading: (
        <div className=" flex flex-col gap-1">
          Uploading {file.name}
          <Progress value={progress} className="w-full h-2" />
        </div>
      ),
      action: (
        <Button variant="destructive" onClick={reset}>
          Cancel
        </Button>
      ),
      classNames: {
        content: "flex-1",
      },
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
        <Button variant="outline" onClick={handleUploadFile} disabled={isUploading}>
          <RiFileUploadLine />
          {isUploading ? <Spinner /> : "Upload File"}
        </Button>
      </EmptyContent>
    </Empty>
  );
};
