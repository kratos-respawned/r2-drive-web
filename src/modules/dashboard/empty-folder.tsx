import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { RiArrowDropUpLine, RiFolder3Fill } from "@remixicon/react";
import { useParams } from "@tanstack/react-router";

export const EmptyFolder = () => {
  const { _splat } = useParams({ from: "/dashboard/$" });
  console.log(_splat);
  return (
    <Empty className="min-h-[80svh]">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary">
          <RiFolder3Fill className="text-primary-foreground" />
        </EmptyMedia>
        <EmptyTitle>Nothing to see here</EmptyTitle>
        <EmptyDescription>
          No files in this folder. Get started by uploading your first file.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">
          <RiArrowDropUpLine />
          Upload File
        </Button>
      </EmptyContent>
    </Empty>
  );
};
