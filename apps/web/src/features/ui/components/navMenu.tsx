"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { ThemeToggle } from "./theme-toggle";
import {cn} from "@gramflow/utils"
export default function NavMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkTheme(theme === "dark" || (theme === "system" && prefersDark));
  }, [theme]);

  const logoSrc = isDarkTheme ? "/cl_logo_dark.svg" : "/cl_logo.svg";

  return (
    <nav
      className={`fixed left-0 top-0 z-20 w-full border-b border-gray-200 ${
        isDarkTheme ? "dark:border-gray-900 dark:bg-gray-950" : "bg-white"
      }`}
    >
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <div className="flex flex-col items-center">
          <a href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} className={cn("-ml-4", isDarkTheme ? "h-10" : "h-12")} alt="Logo" />
          </a>

          <p className="mt-2 text-xs font-light hover:underline">
            Powered By{" "}
            <a
              href="https://gramflow.pro"
              className={`font-bold ${
                isDarkTheme ? "dark:text-blue-400" : "text-blue-600"
              }`}
            >
              GramFlow
            </a>
          </p>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
