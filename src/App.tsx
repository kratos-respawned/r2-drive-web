import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { RedirectToNotFound } from "./components/redirect";
import { Toaster } from "./components/ui/sonner";
import { queryClient } from "./lib/query";
import { UploadManagerRoot } from "./modules/dashboard/uploadManagerRoot";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  notFoundMode: "root",
  defaultNotFoundComponent: () => <RedirectToNotFound />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UploadManagerRoot />
      <RouterProvider router={router} />
      <Toaster visibleToasts={5} />
    </QueryClientProvider>
  );
}
