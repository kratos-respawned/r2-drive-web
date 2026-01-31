import { Progress } from "@/components/ui/progress";
import { useUploadItemActor } from "./hooks/use-upload-item-actor";
import { useUploadStore, type UploadActorRef } from "./store/upload-store";

export function UploadRow({ actor }: { actor: UploadActorRef }) {
  const upload = useUploadItemActor(actor);

  return (
    <div className="upload-row">
      <div>{upload.name}</div>

      <Progress value={upload.progress} max={100} />

      {upload.isError && <div>Error: {upload.error}</div>}

      {upload.isUploading && (
        <button onClick={() => upload.send({ type: "CANCEL" })}>Cancel</button>
      )}

      {upload.isError && <button onClick={() => upload.send({ type: "RETRY" })}>Retry</button>}
    </div>
  );
}

export function UploadProgressPanel() {
  const uploads = useUploadStore((s) => s.uploads);
  const entries = Object.entries(uploads);

  if (!entries.length) return null;

  return (
    <div className="upload-panel">
      {entries.map(([id, actor]) => (
        <UploadRow key={id} actor={actor} />
      ))}
    </div>
  );
}
