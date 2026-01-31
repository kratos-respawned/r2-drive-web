import { FilesAPI } from "@/api/files/api";
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
          null,
          onUploadProgress,
          abortSignal,
        );
      }),
    },
    guards: {
      canRetry: ({ context }) => context.error !== undefined,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFcAOAbA9gQwgSQBcwBbAOlTADsIBLSqAYgGUAVAQQCUWBtABgF1EoVJlg0CNTJSEgAHogCMAViWkATAE4AbAA4A7EoA0IAJ6IALGoWk9AZiXmtvDVaVq9erQF8vxtFlxCElJ-HFp6BggpMFI6ADdMAGsY0NwmMAAnOJoAYzA+QSQQETEJKRl5BD1eVSt9I1NEHXN1O3MdBQN2rQVenz8MMKCyVPDGTIzMDPJ0bAIAMymRwbTM7LyCmRLxSWkiyurahXrjMwRzPR1Sc3Mley0unR6FfpBR4ZCVsYYABQ4AeQA4hwAKJMJibIrbMp7UCVG5qUg6Xg6JQaWwGU6IWxaRGaO5KB4OJ59XxvL4fUZ0RgAYTYADkaSCADKQ4SiHblfaIQ7qY6YxoIWxqK4otEdR7PV7vIhkCZTBiglgcACabOKHJhFR5NT5J0FnT0NjUWicRO6pLJlEwEDgMhlJC2mt22oQAFotFj3aoNL6NHoFESXB41EppRTZeQqGMnaUXdzzmovRdEYGlAp2pZlO5POGAvhI1T6LHObC5IgTVd0eZeKbzAoMbZtLYvSKtKR0-otBoVJ5lKa80NI7BkDk8rB4FDnVy4YgXIinOiBWcOh3eOuEcTni8yQ65RlJhkS1qE-PSIuMQ0zrZV7x+93Qxadz4gA */
    id: "uploadItem",
    initial: "pending",
    context: ({ input }) => ({
      id: input.id,
      name: input.name,
      contentType: input.contentType,
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
            target: "uploading",
            actions: ["initializeAbortController", "clearError", "resetProgress"],
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
