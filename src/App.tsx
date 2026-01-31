import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { RedirectToNotFound } from "./components/redirect";
import { Toaster } from "./components/ui/sonner";
import { queryClient } from "./lib/query";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
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
      <RouterProvider router={router} />
      <Toaster visibleToasts={5} />
    </QueryClientProvider>
  );
}
