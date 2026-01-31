import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { RiHardDrive3Fill } from "@remixicon/react";
import { Link, useRouter } from "@tanstack/react-router";

export const Header = () => {
  return (
    <header className="border-b flex justify-between items-center px-6 py-2">
      <Link
        to="/dashboard"
        className="flex whitespace-nowrap items-center gap-2 self-center font-bold text-lg"
      >
        <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <RiHardDrive3Fill className="size-4" />
        </span>
        Acme Inc.
      </Link>
      <UserDropdown />
    </header>
  );
};

function UserDropdown() {
  const router = useRouter();
  const { data } = authClient.useSession();
  const user = data?.user;

  const nameParts = user?.name?.split(" ") ?? [];
  const initials =
    nameParts.length === 1
      ? (nameParts[0]?.slice(0, 2).toUpperCase() ?? "")
      : nameParts
          .map((name) => name[0])
          .join("")
          .toUpperCase();

  const logout = () => {
    authClient.signOut();
    router.navigate({
      to: "/auth/login",
      search: {
        redirect: location.pathname,
      },
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "bg-primary-foreground hover:bg-primary hover:text-white border border-foreground hover:border-primary ",
            user?.image && "border-none hover:bg-primary-foreground",
          )}
        >
          {user?.image ? (
            <img
              src={user?.image ?? undefined}
              alt={user?.name}
              className="rounded-none after:rounded-none"
            />
          ) : (
            initials
          )}
          {/* <Avatar className="rounded-none after:rounded-none"> */}
          {/* <AvatarImage
              className="rounded-none after:rounded-none"
              src={user?.image ?? undefined}
              alt={user?.name}
            />
            <AvatarFallback className="rounded-none after:rounded-none ">{initials}</AvatarFallback>
          </Avatar> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup></DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={logout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
