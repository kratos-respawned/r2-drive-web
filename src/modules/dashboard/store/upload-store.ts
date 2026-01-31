import type { ActorRefFrom } from "xstate";
import { create } from "zustand";
import type { UploadMachine } from "./files.machine";
export type UploadActorRef = ActorRefFrom<UploadMachine>;
type UploadStore = {
    uploads: Record<string, UploadActorRef>
    addUpload: (id: string, actor: UploadActorRef) => void;
    removeUpload: (id: string) => void;
};

export const useUploadStore = create<UploadStore>((set) => ({
    uploads: {},

    addUpload: (id, actor) =>
        set((state) => ({
            uploads: {
                ...state.uploads,
                [id]: actor,
            },
        })),

    removeUpload: (id) =>
        set((state) => {
            const next = { ...state.uploads };
            delete next[id];
            return { uploads: next };
        }),
}));
