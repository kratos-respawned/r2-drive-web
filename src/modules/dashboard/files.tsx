import type { FileObject } from "@/api/files/dto";
import { GenericFile } from "./file";
import { Folder } from "./folder";
import { FileType, getFileType } from "./fs-utils";

export const FileView = ({ file }: { file: FileObject }) => {
  const fileType = getFileType(file.contentType);

  switch (fileType) {
    case FileType.FOLDER:
      return <Folder path={file.path} id={file.id} name={file.name} />;
    default:
      return <GenericFile name={file.name} id={file.id} path={file.path} type={fileType} />;
  }
};
