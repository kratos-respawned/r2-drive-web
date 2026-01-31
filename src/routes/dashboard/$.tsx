import { FilesAPI } from "@/api/files/api";
import { EmptyFolder } from "@/modules/dashboard/empty-folder";
import { FileView } from "@/modules/dashboard/files";
import { useFolderStructure } from "@/modules/dashboard/hooks/use-folder-structure";
import { useUploadStore } from "@/modules/dashboard/store/upload-store";
import { UploadProgressPanel } from "@/modules/dashboard/upload-row";
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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const uploads = useUploadStore((s) => s.uploads);
  const entries = Object.entries(uploads);
  if (isPending) return <div></div>;
  if (data?.items.length === 0) {
    return <EmptyFolder />;
  }
  return (
    <>
      <div className="flex flex-wrap gap-4 px-6 py-2">
        {data?.items.map((file) => (
          <FileView file={file} key={file.id} />
        ))}
        {/* {entries.map(([id, actor]) => <>{
          actor.
        }</>)} */}
        <UploadProgressPanel />
      </div>
    </>
  );
}

// function UploadToastContent({ data, t }: { data: FileObject[]; t: string | number }) {
//   return (
//     <ItemGroup className="bg-white border">
//       {data.map((file) => (
//         <Item key={file.name} size="xs">
//           <ItemMedia variant="icon">
//             {getFileIconFromFileType(getFileType(file.contentType), { className: "w-5 h-5" })}
//           </ItemMedia>
//           <ItemContent className="inline-block truncate">
//             <ItemTitle className="inline">{file.name}</ItemTitle>
//           </ItemContent>
//           <ItemContent>
//             <Progress value={50} className="w-32" />
//           </ItemContent>
//           <ItemActions className=" justify-end">
//             <span className="text-muted-foreground text-sm">{"asdasd"}</span>
//             <Button
//               variant={"destructive"}
//               size={"xs"}
//               onClick={() => {
//                 toast.dismiss(t);
//               }}
//             >
//               Cancel
//             </Button>
//           </ItemActions>
//         </Item>
//       ))}
//     </ItemGroup>
//   );
// }
