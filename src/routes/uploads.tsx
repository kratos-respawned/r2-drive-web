import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadsTable } from "@/modules/dashboard/uploads-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/uploads")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-screen">
      <div>
        <Header />
      </div>
      <div className="min-h-0 overflow-y-auto pt-7">
        <div className="flex flex-col gap-10 flex-wrap  px-6 py-2">
          <div>
            <h1 className="text-2xl font-bold">Upload Manager</h1>
            <p className="text-sm text-muted-foreground">Manage your current and past uploads.</p>
          </div>
          <Tabs defaultValue="current">
            <TabsList variant="line" className="border-b w-full justify-start">
              <TabsTrigger
                value="current"
                className="text-sm after:bg-primary border-b grow-0 data-active:text-primary"
              >
                Active Uploads
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="text-sm after:bg-primary border-b grow-0 data-active:text-primary"
              >
                Upload History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              <UploadsTable />
            </TabsContent>
            <TabsContent value="past"></TabsContent>
          </Tabs>
        </div>
      </div>
      <footer className="p-4 border-t  flex flex-col md:flex-row justify-between text-xs font-mono bg-gray-50 dark:bg-zinc-900">
        <div className="mb-2 md:mb-0">
          <span className="font-bold text-black dark:text-white">34 items</span> selected
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-none"></span>
            <span className="uppercase tracking-wider font-bold">System Online</span>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 pl-4">v2.4.0</div>
        </div>
      </footer>
    </div>
  );
}
