import type { ActorRef, Snapshot } from "xstate";

/** Ref the upload item uses to notify the manager when it finishes (success or error). */
export type UploadManagerRef = ActorRef<Snapshot<unknown>, { type: "UPLOAD_FINISHED"; id: string; parentPath: string }>;

// Upload Item Types
export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface UploadItemData {
    id: string;
    name: string;
    contentType: string;
    parentPath: string;
    file: File;
}

export interface UploadItemState {
    id: string;
    name: string;
    contentType: string;
    file: File;
    parentPath: string;
    status: UploadStatus;
    uploadProgress: number;
    error?: string;
    abortController?: AbortController;
}

// State Machine Context
export interface UploadMachineContext {
    id: string;
    name: string;
    contentType: string;
    file: File;
    parentPath: string;
    uploadProgress: number;
    error?: string;
    abortController?: AbortController;
    /** Used to notify manager when this upload finishes (success or error). */
    parentRef?: UploadManagerRef;
}

// State Machine Events
export type UploadMachineEvent =
    | { type: "START" }
    | { type: "PROGRESS"; progress: number }
    | { type: "SUCCESS" }
    | { type: "ERROR"; error: string }
    | { type: "CANCEL" }
    | { type: "RETRY" };

// State type union for type-safe state checking
export type UploadMachineState =
    | { value: "pending"; context: UploadMachineContext }
    | { value: "uploading"; context: UploadMachineContext & { abortController: AbortController } }
    | { value: "success"; context: UploadMachineContext }
    | { value: "error"; context: UploadMachineContext & { error: string } };

// Upload function type

// Input type for creating the machine
export interface UploadMachineInput {
    id: string;
    name: string;
    contentType: string;
    file: File;

    parentPath: string;
    /** Passed by upload manager so this machine can notify when it finishes. */
    parentRef?: UploadManagerRef;
}

export type UploadManagerEvent =
    | {
        type: "FILES_SELECTED";
        files: File[];
        parentPath: string;
    }
    | { type: "UPLOAD_FINISHED"; id: string; parentPath: string };

export type UploadManagerContext = {
    pendingIds: string[];
    activeIds: string[];
};
