import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useParams } from "@tanstack/react-router";

const MAX_BREADCRUMBS = 5;
export const FsBreadcrumbs = () => {
  const { _splat } = useParams({ from: "/dashboard/$" });

  const pathnameParts = (_splat?.split("/").filter(Boolean) ?? []).slice(1);
  const pathnameTree = pathnameParts?.map((part, index) => {
    return {
      name: part,
      path: pathnameParts.slice(0, index + 1).join("/"),
    };
  });
  const dropdownMenuItems =
    pathnameTree.length > MAX_BREADCRUMBS ? pathnameTree.slice(1, pathnameTree.length - 2) : [];
  const breadcrumbItems =
    pathnameTree.length > MAX_BREADCRUMBS ? pathnameTree.slice(-2) : pathnameTree;

  return (
    <Breadcrumb>
      <BreadcrumbList className="h-7">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard/$" params={{ _splat: "home" }}>
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {dropdownMenuItems.length > 0 && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost">
                    <BreadcrumbEllipsis />
                    <span className="sr-only"> Toggle menu </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {dropdownMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path}>
                      <Link to="/dashboard/$" params={{ _splat: item.path }}>
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {breadcrumbItems.map((item, index) => (
          <>
            <BreadcrumbItem key={index}>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/$" params={{ _splat: item.path }}>
                  {item.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ))}
        {breadcrumbItems.length > 0 && (
          <BreadcrumbItem>
            <BreadcrumbPage>{breadcrumbItems[breadcrumbItems.length - 1].name}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
