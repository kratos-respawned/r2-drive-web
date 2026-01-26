import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const RedirectToNotFound = () => {
  const router = useRouter();
  useEffect(() => {
    router.navigate({ to: "/not_found" });
  }, []);
  return null;
};
