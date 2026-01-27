import { FilesAPI } from "@/api/files/api";
import { EmptyFolder } from "@/modules/dashboard/empty-folder";
import { Folder } from "@/modules/dashboard/folder";
import { useFolderStructure } from "@/modules/dashboard/hooks/use-folder-structure";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const folderStructure = useFolderStructure();
  const { data, isPending } = useQuery({
    queryKey: FilesAPI.listFiles.key(folderStructure),
    queryFn: () => FilesAPI.listFiles.fn(folderStructure),
  });
  if (isPending) return <div></div>;
  if (data?.items.length === 0) {
    return <EmptyFolder />;
  }
  return (
    <>
      <div className="grid grid-cols-12 gap-4 px-6 py-2">
        {data?.items.map((file) => (
          <Folder path={file.path} id={file.id} key={file.id} name={file.name} />
        ))}
      </div>
    </>
  );
}
