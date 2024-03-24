"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AuthNavMenu from "~/features/ui/components/authNavMenu";
import { DashboardNavigation } from "./components/dashboardNavigation";
import { SheetTrigger, SheetContent, Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, Sheet, DropdownMenuItem, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Checkbox, Button, Card, Loader } from "@gramflow/ui";
import { Package2, Menu, Search, UserCircle } from "lucide-react";
import { AppConfig, cn } from "@gramflow/utils";
import { toast } from "sonner";
import { fontSans } from "~/lib/fonts";
import useSessionWithLoading from "~/features/hooks/use-session-auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname();
  const [activeTab, setActiveTab] = useState<string>("");
  const { loading, session } = useSessionWithLoading()

  useEffect(() => {

    setActiveTab(currentPath);
  }, [currentPath]);


  const navigationLinks = [
    {
      title: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
    },
    {
      title: "Bundles",
      href: "/dashboard/bundles",
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
    }
  ]
  return (
    <div className="">

      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >

              <span className="text">{
                AppConfig.StoreName.split(" ")[0]
              }</span>
            </Link>
            {
              navigationLinks.map((link) => {
                return (
                  <Link
                    href={link.href}
                    className={cn(activeTab.includes(link.title.toLowerCase())
                      ? "text-foreground"
                      : "text-muted-foreground",
                      "transition-colors hover:text-foreground")}
                  >
                    {link.title}
                  </Link>
                )
              })
            }
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                {
                  navigationLinks.map((link) => {
                    return (
                      <Link
                        href={link.href}
                        className={cn(activeTab.includes(link.title.toLowerCase())
                          ? "text-foreground"
                          : "text-muted-foreground",
                          "transition-colors hover:text-foreground")}
                      >
                        {link.title}
                      </Link>
                    )
                  })
                }
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form className="ml-auto flex-1 sm:flex-initial">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                />
              </div>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <UserCircle className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={fontSans.className} align="end">  
                <span className="text-sm text-muted-foreground p-2">{session?.user?.email ? session?.user?.email : <Loader />}</span>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          {/* <div className="mx-auto grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
          <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
            <nav className="grid gap-4 text-sm text-muted-foreground">
              <Link href="#" className="font-semibold text-primary">
                General
              </Link>
              <Link href="#">Security</Link>
              <Link href="#">Integrations</Link>
              <Link href="#">Support</Link>
              <Link href="#">Organizations</Link>
              <Link href="#">Advanced</Link>
            </nav>
          </div> */}

          {children}
        </main>
      </div>
    </div >
  );
}
