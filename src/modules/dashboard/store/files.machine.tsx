import { FilesAPI } from "@/api/files/api";
import { createCoverWebpThumbnail } from "@/lib/generate-thumb";
import type { AxiosError, AxiosProgressEvent } from "axios";
import { assign, fromPromise, setup } from "xstate";
import { calculateUploadProgress } from "../fs-utils";
import type { UploadMachineContext, UploadMachineInput } from "./fs-machine.types";

export const createUploadMachine = () => {
  return setup({
    types: {
      context: {} as UploadMachineContext,
      events: {} as
        | { type: "START" }
        | { type: "PROGRESS"; progress: number }
        | { type: "SUCCESS"; parentPath: string }
        | { type: "ERROR"; error: string }
        | { type: "CANCEL" }
        | { type: "RETRY" },
      input: {} as UploadMachineInput,
    },
    actions: {
      initializeAbortController: assign({
        abortController: () => new AbortController(),
      }),
      updateProgress: assign({
        uploadProgress: (_, params: { progress: number }) => params.progress,
      }),
      setError: assign({
        error: (_, params: { error: string }) => params.error,
      }),
      clearError: assign({
        error: () => undefined,
      }),
      resetProgress: assign({
        uploadProgress: () => 0,
      }),
      abortUpload: ({ context }) => {
        context.abortController?.abort();
      },
      cleanupAbortController: assign({
        abortController: () => undefined,
      }),
      notifyParentFinished: ({ context }) => {
        if (context.parentRef) {
          context.parentRef.send({
            type: "UPLOAD_FINISHED",
            id: context.id,
            parentPath: context.parentPath,
          });
        }
      },
    },
    actors: {
      uploadActor: fromPromise<
        void,
        { context: UploadMachineContext; onUploadProgress: (progress: AxiosProgressEvent) => void }
      >(async ({ input, signal }) => {
        const { context, onUploadProgress } = input;
        const abortSignal = context.abortController?.signal ?? signal;
        await FilesAPI.uploadFileComplete(
          context.file,
          context.parentPath,
          context.thumbnail,
          onUploadProgress,
          abortSignal,
        );
      }),
      generateThumbnail: fromPromise<File | null, { file: File }>(async ({ input }) => {
        const thumbnail = await createCoverWebpThumbnail(input.file, 256, 0.75);
        return thumbnail;
      }),
    },
    guards: {
      canRetry: ({ context }) => context.error !== undefined,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFcAOAbA9gQwgSQBcwBbAOlTADsIBLSqAYgGUAVAQQCUWBtABgF1EoVJlg0CNTJSEgAHogCMAViWkATAE4AbAA4A7EoA0IAJ6IALGoWk9AZiXmtvDVaVq9erQF8vxtFlxCElJ-HFp6BggpMFI6ADdMAGsY0NwmMAAnOJoAYzA+QSQQETEJKRl5BD1eVSt9I1NEHXN1O3MdBQN2rQVenz8MMKCyVPDGTIzMDPJ0bAIAMymRwbTM7LyCmRLxSWkiyurahXrjMwQlXh1SLTcdF2OVDT0db18QUeGQlbGGAAUOADyAHEOABRJhMTZFbZlPagSrmSykHSXJQaWwGU6IWxaNTqDRKexaLovPpvD5EZYBH4AYTYADkaaCADJQ4SiHblfaIQ7qY6YxoIWxqK6ojQdEk9BT9d7fT4TKYMMEsDgATTZxQ5sIqPJqfJOgs6ehsai0TmJDlJ0pllEwEDgMgpJC2Wt2OoQAFotFjPaoNP6CSL7r1eOY9DKnWQKNQ6FAXaU3dyEJYfWG8Qobgp2pZlO5PBG5ZSvtTY-HOXC5IhTVd0eZeGbzAoMbZtLYfSKtKQlPytASlJ5lGaC9TPrBkDk8rB4NDXVz4YgXHinOiBWcOl3eJvEWpLVLrQMR0WFRky9qk4vrs4MQ0zrZ17xB72d90yT4gA */
    id: "uploadItem",
    initial: "pending",
    context: ({ input }) => ({
      id: input.id,
      name: input.file.name,
      contentType: input.file.type,
      file: input.file,
      uploadProgress: 0,
      parentPath: input.parentPath,
      error: undefined,
      abortController: undefined,
      parentRef: input.parentRef,
    }),
    states: {
      pending: {
        on: {
          START: {
            target: "preparing",
            actions: ["initializeAbortController", "clearError", "resetProgress"],
          },
        },
      },
      preparing: {
        invoke: {
          id: "generateThumbnail",
          src: "generateThumbnail",
          input: ({ context }) => ({ file: context.file }),
          onDone: {
            target: "uploading",
            actions: [
              assign({
                thumbnail: ({ event }) => event.output,
              }),
            ],
          },
          onError: {
            target: "error",
            actions: ["cleanupAbortController", "notifyParentFinished"],
          },
        },
      },
      uploading: {
        invoke: {
          id: "uploadService",
          src: "uploadActor",
          input: ({ context, self }) => ({
            context,
            onUploadProgress: (progress: AxiosProgressEvent) => {
              self.send({ type: "PROGRESS", progress: calculateUploadProgress(progress) });
            },
          }),
          onDone: {
            target: "success",
            actions: ["cleanupAbortController", "notifyParentFinished"],
          },
          onError: {
            target: "error",
            actions: [
              {
                type: "setError",
                params: ({ event }) => ({
                  error:
                    // @ts-expect-error - AxiosError has a response property
                    (event.error as AxiosError)?.response?.data?.error ?? "Unknown error",
                }),
              },
              "cleanupAbortController",
              "notifyParentFinished",
            ],
          },
        },
        on: {
          PROGRESS: {
            actions: [
              {
                type: "updateProgress",
                params: ({ event }) => ({ progress: event.progress }),
              },
            ],
          },
          CANCEL: {
            target: "error",
            actions: [
              "abortUpload",
              { type: "setError", params: { error: "Upload cancelled" } },
              "cleanupAbortController",
              "notifyParentFinished",
            ],
          },
        },
      },
      success: {
        type: "final",
        entry: assign({
          uploadProgress: () => 100,
          parentPath: ({ event: _event, context }) => context.parentPath,
        }),
      },
      error: {
        on: {
          RETRY: {
            target: "uploading",
            guard: "canRetry",
            actions: ["initializeAbortController", "clearError", "resetProgress"],
          },
        },
      },
    },
  });
};

export type UploadMachine = ReturnType<typeof createUploadMachine>;
