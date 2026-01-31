import { useSelector } from "@xstate/react";
import type { UploadActorRef } from "../store/upload-store";

export function useUploadItemActor(actorRef: UploadActorRef) {
  const state = useSelector(actorRef, (s) => s);

  return {
    state,
    send: actorRef.send,
    contentType: useSelector(actorRef, (s) => s.context.contentType),
    progress: useSelector(actorRef, (s) => s.context.uploadProgress),
    error: useSelector(actorRef, (s) => (s.matches("error") ? s.context.error : undefined)),
    isPending: useSelector(actorRef, (s) => s.matches("pending")),
    isUploading: useSelector(actorRef, (s) => s.matches("uploading")),
    isSuccess: useSelector(actorRef, (s) => s.matches("success")),
    isError: useSelector(actorRef, (s) => s.matches("error")),
  };
}
