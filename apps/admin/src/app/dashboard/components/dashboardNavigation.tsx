"use client"
import { useRouter } from "next/navigation";
import {  Plus } from "lucide-react";

import {
  Button as UiButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@gramflow/ui";
import { Button } from "@tremor/react"
import Link from "next/link";

export function DashboardNavigation() {
  const router = useRouter();
  return (
    <div className="flex space-x-3">
      <Button>
        <Link href="/new" rel="noopener noreferrer" target="_blank">
          Create Order
        </Link>
      </Button>
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
