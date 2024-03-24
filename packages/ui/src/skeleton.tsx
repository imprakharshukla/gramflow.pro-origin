import { cn } from "@gramflow/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function SVGSkeleton({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <svg
      className={
        className + " animate-pulse rounded bg-gray-300"
      }
    />

  )
}

export { Skeleton, SVGSkeleton };
