import { useSelector } from "@xstate/react";
import { useUploadStore, type UploadActorRef } from "../store/upload-store";

export function useUploadItemActor(actorRef: UploadActorRef) {
  const removeUploadActor = useUploadStore((s) => s.removeUpload);
  const id = useSelector(actorRef, (s) => s.context.id);
  const removeUpload = () => {
    actorRef.send({ type: "CANCEL" });
    removeUploadActor(id);
  };
  return {
    send: actorRef.send,
    size: useSelector(actorRef, (s) => s.context.file.size),
    parentPath: useSelector(actorRef, (s) => s.context.parentPath),
    name: useSelector(actorRef, (s) => s.context.file.name),
    contentType: useSelector(actorRef, (s) => s.context.file.type),
    progress: useSelector(actorRef, (s) => s.context.uploadProgress),
    error: useSelector(actorRef, (s) => (s.matches("error") ? s.context.error : undefined)),
    isPending: useSelector(actorRef, (s) => s.matches("pending")),
    isUploading: useSelector(actorRef, (s) => s.matches("uploading")),
    isSuccess: useSelector(actorRef, (s) => s.matches("success")),
    isError: useSelector(actorRef, (s) => s.matches("error")),
    deleteFile: removeUpload,
  };
}
