import { Loader } from "@gramflow/ui";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader />
    </div>
  );
}
