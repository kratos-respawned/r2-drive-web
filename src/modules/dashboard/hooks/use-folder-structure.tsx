import { useParams } from "@tanstack/react-router";

export const useFolderStructure = () => {
  const { _splat } = useParams({ from: "/dashboard/$" });
  if (!_splat) return "";
  else return _splat.charAt(-1) === "/" ? _splat.slice(0, -1) : _splat;
};
