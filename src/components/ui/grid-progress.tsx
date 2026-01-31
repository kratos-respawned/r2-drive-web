import { cn } from "@/lib/utils";

interface GridProgressProps {
  progress: number;
  count?: number;
  className?: string;
  containerClassName?: string;
}

export const GridProgress = ({
  progress,
  count = 20,
  className,
  containerClassName,
}: GridProgressProps) => {
  const coloredElements = Math.floor((progress / 100) * count);
  return (
    <div className={cn("flex gap-[2px] h-2.5 w-full", containerClassName)}>
      {Array.from({ length: count }).map((_, index) => (
        <span
          data-active={index < coloredElements}
          className={cn("flex-1 h-full data-[active=true]:bg-primary bg-foreground", className)}
        />
      ))}
      {/* <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-black dark:bg-white h-full"></div>
      <div className="flex-1 bg-primary h-full"></div>
      <div className="flex-1 bg-primary h-full"></div>
      <div className="flex-1 bg-primary h-full"></div>
      <div className="flex-1 bg-primary h-full"></div>
      <div className="flex-1 bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 h-full"></div>
      <div className="flex-1 bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 h-full"></div>
      <div className="flex-1 bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 h-full"></div> */}
    </div>
  );
};
