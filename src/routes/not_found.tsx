import { NotFound } from "@/components/not-found";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/not_found")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NotFound />;
}
