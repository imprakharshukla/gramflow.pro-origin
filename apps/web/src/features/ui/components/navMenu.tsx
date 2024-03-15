"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

import { cn } from "@gramflow/utils"
import { Avatar, AvatarImage, AvatarFallback, Button, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger, Loader } from "@gramflow/ui";
import { User, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";
import useSessionWithLoading from "../hooks/use-session-auth";
import { signOut } from "next-auth/react";
export default function NavMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // useEffect(() => {
  //   const prefersDark = window.matchMedia(
  //     "(prefers-color-scheme: dark)",
  //   ).matches;
  //   setIsDarkTheme(theme === "dark" || (theme === "system" && prefersDark));
  // }, [theme]);

  // const logoSrc = isDarkTheme ? "/cl_logo_dark.svg" : "/cl_logo.svg";


  const { loading, session } = useSessionWithLoading();
  return (
    <nav
      className={`z-20 w-full bg-card border border-border rounded-b-lg}`}
    >
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <div className="flex flex-col justify-center">
          <a href="/" className="fill-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={"/cl_logo_dark.svg"} className={cn("", isDarkTheme ? "h-8" : "h-8 fill-white")} alt="Logo" />
          </a>

          <p className="mt-2 text-xs font-light hover:underline">
            Powered By{" "}
            <a
              href="https://gramflow.pro"
              className={`font-bold ${isDarkTheme ? "dark:text-blue-400" : "text-blue-600"
                }`}
            >
              GramFlow
            </a>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {loading ? <Loader /> : session?.user ?
            <DropdownMenu>
              <DropdownMenuTrigger className="border-border" asChild>
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${session.user.email}`} alt="user_img" />
                  <AvatarFallback>{
                    "RS"
                  }
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mx-3">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Address</span>
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  signOut()
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            : <Button size={"sm"}><Link href="/login">Login</Link></Button>
          }
          {/* <ThemeToggle /> */}
        </div>
      </div>
    </nav >
  );
}
