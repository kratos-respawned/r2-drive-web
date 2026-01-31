import { FilesAPI } from "@/api/files/api";
import { queryClient } from "@/lib/query";
import { nanoid } from "nanoid";
import { assign, setup } from "xstate";
import { createUploadMachine } from "./files.machine";
import type { UploadMachineInput, UploadManagerContext, UploadManagerEvent } from "./fs-machine.types";
import { useUploadStore } from "./upload-store";

const MAX_CONCURRENT_UPLOADS = 3;



const uploadItemMachine = createUploadMachine();

export const uploadManagerMachine = setup({
    types: {
        context: {} as UploadManagerContext,
        events: {} as UploadManagerEvent,
    },

    actors: {
        uploadItem: uploadItemMachine,
    },

    actions: {
        spawnUploads: assign(({ context, event, spawn, self }) => {
            if (event.type !== "FILES_SELECTED") return {};
            const { addUpload } = useUploadStore.getState();
            const newIds: string[] = [];
            for (const file of event.files) {
                const id = nanoid();
                const actor = spawn("uploadItem", {
                    id,
                    input: {
                        id,
                        name: file.name,
                        docType: file.type,
                        file,
                        parentPath: event.parentPath,
                        parentRef: self,
                    } satisfies UploadMachineInput,
                });
                addUpload(id, actor);
                newIds.push(id);
            }
            return {
                pendingIds: [...context.pendingIds, ...newIds],
            };
        }),

        startNext: assign(({ context }) => {
            const { uploads } = useUploadStore.getState();
            const activeCount = context.activeIds.length;
            const toStart = Math.min(MAX_CONCURRENT_UPLOADS - activeCount, context.pendingIds.length);
            if (toStart <= 0) return {};
            const idsToStart = context.pendingIds.slice(0, toStart);
            for (const id of idsToStart) {
                const ref = uploads[id];
                if (ref) ref.send({ type: "START" });
            }
            return {
                pendingIds: context.pendingIds.slice(toStart),
                activeIds: [...context.activeIds, ...idsToStart],
            };
        }),

        removeFromActive: assign(({ context, event }) => {
            if (event.type !== "UPLOAD_FINISHED") return {};
            queryClient.invalidateQueries({ queryKey: FilesAPI.listFiles.key(event.parentPath) });
            return {
                activeIds: context.activeIds.filter((id) => id !== event.id),
            };
        }),
    },
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFcAOAbA9gQwgWWwDtsYAnAOgEsJ0wBiAMQEkAZAUQGUB9Dt9gYQAqbACIBtAAwBdRKFSZYlAC6VMhWSAAeiACwBGcgE5jJ06YA0IAJ6IAHAYCsE5xP0BmAOxu3ANkM+AXyDLQkwIOA00LFwCYjINeUUVNQ1tBABaH3IXHNznD0sbDMCAyyicfCISMApqWgSFZVV1JC1EQwMfNwAmW26dCVtDWx8dYcLEPT6jBzc9Nx1ujvnXWyCgoA */

    id: "uploadManager",
    initial: "idle",
    context: {
        pendingIds: [],
        activeIds: [],
    },

    states: {
        idle: {
            on: {
                FILES_SELECTED: {
                    actions: ["spawnUploads", "startNext"],
                },
                UPLOAD_FINISHED: {
                    actions: ["removeFromActive", "startNext"],
                },
            },
        },
    },
});
export type UploadMachineMachine = typeof uploadManagerMachine;