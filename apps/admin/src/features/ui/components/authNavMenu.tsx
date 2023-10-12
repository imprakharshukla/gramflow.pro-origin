"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { AppConfig } from "@acme/utils";
import { ThemeToggle } from "./theme-toggle";

export default function AuthNavMenu() {
  return (
    <nav className="z-20 w-full border dark:border-gray-900 dark:bg-gray-950">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <div>
          <Link href={`/`} className="text-lg font-bold">
            {/* {theme === "dark" ? ( */}
            {AppConfig.StoreName} Admin {/* ) : ( */}
            {/* <img src="/cl_logo.svg" className="mr-3 h-12" alt="Logo" /> */}
            {/* )} */}
          </Link>
          <p className="py-1 text-xs font-light">
            Powered By{" "}
            <a
              href="https://gramflow.pro"
              className="font-bold text-blue-600  dark:text-blue-400"
            >
              Gramflow
            </a>
          </p>
        </div>

        <div className="flex items-center gap-x-3">
          <div className={"p-3"}>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
