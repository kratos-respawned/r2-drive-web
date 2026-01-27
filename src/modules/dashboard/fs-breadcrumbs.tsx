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
import { Link } from "@tanstack/react-router";
import { useFolderStructure } from "./hooks/use-folder-structure";

const MAX_BREADCRUMBS = 3;
export const FsBreadcrumbs = () => {
  const folderStructure = useFolderStructure();

  const pathnameParts = folderStructure?.split("/").filter(Boolean) ?? [];
  console.log({ pathnameParts });

  const pathnameTree = pathnameParts?.map((part, index) => {
    return {
      name: part,
      path: pathnameParts.slice(0, index + 1).join("/"),
    };
  });

  const dropdownMenuItems =
    pathnameTree.length > MAX_BREADCRUMBS ? pathnameTree.slice(0, pathnameTree.length - 2) : [];
  const breadcrumbItems =
    pathnameTree.length > MAX_BREADCRUMBS ? pathnameTree.slice(-2) : pathnameTree;

  return (
    <Breadcrumb>
      <BreadcrumbList className="h-7">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard/$" params={{ _splat: "" }}>
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

        {breadcrumbItems.slice(0, -1).map((item, index) => (
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
