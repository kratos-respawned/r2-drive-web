import { FilesAPI } from "@/api/files/api";
import { EmptyFolder } from "@/modules/dashboard/empty-folder";
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
  return (
    <>
      <EmptyFolder />
      {/* <ContextMenu>
      <ContextMenuTrigger>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>New Folder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu> */}
    </>
  );
}
