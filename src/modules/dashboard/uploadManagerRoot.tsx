import { useMachine } from "@xstate/react";
import { uploadManagerMachine } from "./store/upload-manager.machine";

export function UploadManagerRoot() {
  useMachine(uploadManagerMachine);
  return null;
}
