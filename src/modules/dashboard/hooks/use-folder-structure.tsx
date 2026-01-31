import { useLocation } from "@tanstack/react-router";

export const useFolderStructure = () => {
  const { pathname } = useLocation();
  const pathnameParts = pathname.split("/").filter(Boolean);
  if (pathnameParts.at(0) !== "dashboard") {
    throw new Error("Path is not a dashboard path");
  }
  pathnameParts.shift();
  const newPath = pathnameParts.join("/");
  console.log({ newPath });
  return newPath;
};
