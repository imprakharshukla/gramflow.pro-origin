import { cn } from "@gramflow/utils";
import { Loader2 } from "lucide-react";

export function Loader({ className, size }: { className?: string, size?: number }) {
  return (
    <Loader2 size={size ? size : 16} className={cn(" animate-spin", className)} />
  )
}
