import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const router = useRouter();
  useEffect(() => {
    router.navigate({
      to: "/dashboard/$",
      params: { _splat: "" },
    });
  }, []);

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}
