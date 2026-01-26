import { Header } from "@/components/header";
import { FsBreadcrumbs } from "@/modules/dashboard/fs-breadcrumbs";
import { NewFolder } from "@/modules/dashboard/new-folder";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="flex justify-between items-center px-6 pt-2 ">
        <FsBreadcrumbs />
        <NewFolder />
      </div>
      <Outlet />
    </div>
  );
}
