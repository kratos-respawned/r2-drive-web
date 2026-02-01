import { GridProgress } from "@/components/ui/grid-progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FileIconFromFileType, getFileSize, getFileSizeInKB, getFileType } from "./fs-utils";
import { useUploadItemActor } from "./hooks/use-upload-item-actor";
import { useUploadStore, type UploadActorRef } from "./store/upload-store";

export const UploadsTable = () => {
  const uploads = useUploadStore((s) => s.uploads);
  const entries = Object.entries(uploads);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">File Name</TableHead>
          <TableHead className="font-bold">Size</TableHead>
          <TableHead className="font-bold max-w-[100px]">Progress</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map(([id, actor]) => (
          <UploadRow key={id} actor={actor} />
        ))}
      </TableBody>
    </Table>
  );
};

const UploadRow = ({ actor }: { actor: UploadActorRef }) => {
  const upload = useUploadItemActor(actor);
  return (
    <TableRow className="">
      <TableCell className="font-medium">
        <div className="max-w-[300px] truncate flex items-center gap-2">
          <FileIconFromFileType
            fileType={getFileType(upload.contentType)}
            className={cn("drop-shadow-md size-4 shrink-0")}
          />
          <span>{upload.name}</span>
        </div>
      </TableCell>
      <TableCell>{getFileSize(getFileSizeInKB(upload.size))}</TableCell>
      <TableCell>
        <div className="max-w-xs">
          <div className="flex justify-between gap-2">
            {upload.isUploading ? (
              <span className="text-primary">Uploading...</span>
            ) : upload.isSuccess ? (
              <span className="text-green-500">Uploaded</span>
            ) : upload.isError ? (
              <span className="text-destructive">Error: {upload.error}</span>
            ) : (
              <span className="text-primary">Pending</span>
            )}
            {upload.isUploading && <span>{upload.progress}%</span>}
          </div>
          {upload.isUploading && <GridProgress progress={upload.progress} count={10} />}
        </div>
      </TableCell>
      <TableCell className="text-right">{}</TableCell>
    </TableRow>
  );
};
