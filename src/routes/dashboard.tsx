import { Header } from "@/components/header";
import { FsBreadcrumbs } from "@/modules/dashboard/fs-breadcrumbs";
import { UploadManagerRoot } from "@/modules/dashboard/uploadManagerRoot";
import { NewFolder } from "@/modules/dashboard/view-uploads";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <>
      <UploadManagerRoot />
      <div className="grid grid-rows-[auto_1fr_auto] h-screen">
        <div className="pb-6">
          <Header />
          <div className="flex justify-between items-center px-6 py-2 border-b  ">
            <FsBreadcrumbs />
            <NewFolder />
          </div>
        </div>
        {/* scrollable container — takes remaining space, overflow in y */}
        <div className="min-h-0 overflow-y-auto">
          <Outlet />
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
    </>
  );
}
