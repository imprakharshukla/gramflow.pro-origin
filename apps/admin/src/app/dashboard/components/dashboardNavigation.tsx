"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@tremor/react";
import { Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button as UiButton,
} from "@gramflow/ui";

export function DashboardNavigation() {
  const router = useRouter();
  return (
    <div className="flex space-x-3">
      <UiButton>
        <Link href="/new" rel="noopener noreferrer" target="_blank">
          Create Order
        </Link>
      </UiButton>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UiButton variant="outline">
            <Plus className="h-4 w-4" />
          </UiButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              router.push("/order");
            }}
          >
            Create Order with Links
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              router.push("/prebook/new");
            }}
          >
            Create Pre-booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
