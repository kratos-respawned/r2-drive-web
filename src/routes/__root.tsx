import { authClient } from "@/lib/auth";
import type { FileRouteTypes } from "@/routeTree.gen";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
const RootLoader = () => {
  return <div className="grid place-items-center h-screen">Authenticating...</div>;
};
const RootLayout = () => {
  const { isPending, data, error } = authClient.useSession();
  const authRoutes: Array<FileRouteTypes["fullPaths"]> = [
    "/auth/login",
    "/auth/reset-password",
    "/auth/signup",
  ] as const;
  const router = useRouter();
  const location = useLocation();
  if (isPending) return <RootLoader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.user && !authRoutes.includes(location.pathname as FileRouteTypes["fullPaths"])) {
    router.navigate({
      to: "/auth/login",
      search: {
        redirect: location.pathname,
      },
    });
  }
  if (data?.user && authRoutes.includes(location.pathname as FileRouteTypes["fullPaths"])) {
    router.navigate({
      to: "/dashboard/$",
      params: {
        _splat: "",
      },
    });
  }
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
