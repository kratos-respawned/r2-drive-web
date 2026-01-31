import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadProgressPanel } from "@/modules/dashboard/upload-row";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/uploads")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-10 flex-wrap  px-6 py-2">
      <div>
        <h1 className="text-2xl font-bold">Upload Manager</h1>
        <p className="text-sm text-muted-foreground">Manage your current and past uploads.</p>
      </div>
      <Tabs defaultValue="current">
        <TabsList variant="line" className="border-b w-full m justify-start">
          <TabsTrigger
            value="current"
            className="after:bg-primary border-b grow-0 data-active:text-primary"
          >
            Active Uploads
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="after:bg-primary border-b grow-0 data-active:text-primary"
          >
            Upload History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <UploadProgressPanel />
        </TabsContent>
        <TabsContent value="past">
          <div>
            <h2>Past Uploads</h2>
            <p>Manage your past uploads.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
