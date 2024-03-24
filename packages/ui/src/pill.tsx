import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@gramflow/utils";

const pillVariants = cva(
    "text-xs font-medium me-2 px-2.5 py-0.5 rounded-full",
    {
        variants: {
            variant: {
                red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                teal: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
                purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
                fuchsia: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300",
                gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
                green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
                lime: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300",
                orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
                pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
                violet: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
                yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                slate: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
                zinc: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
                neutral: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300",
                stone: "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300",
                amber: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
                sky: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
                rose: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
                default:
                    "bg-primary hover:bg-primary/80 border-transparent text-primary-foreground",
                secondary:
                    "bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
                destructive:
                    "bg-destructive hover:bg-destructive/80 border-transparent text-destructive-foreground",
                outline: "text-foreground",
            },
        },
        defaultVariants: {
            variant: "default", // Default variant as the default value
        },
    }
);

export interface PillProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> { }

function Pill({ className, variant, ...props }: PillProps) {
    return (
        <span className={cn(pillVariants({ variant }), className)} {...props} />
    );
}

export { Pill, pillVariants };
