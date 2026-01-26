import { ResetPasswordForm } from "@/modules/auth/form/reset-password";
import { RiHardDrive3Fill } from "@remixicon/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/reset-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <RiHardDrive3Fill className="size-4" />
          </div>
          Acme Inc.
        </Link>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
