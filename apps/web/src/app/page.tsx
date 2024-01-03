"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@gramflow/ui";
import { cn } from "@gramflow/utils";

import HeroComponent from "~/features/ui/components/hero";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkTheme(theme === "dark" || (theme === "system" && prefersDark));
  }, [theme]);

  const logoSrc = isDarkTheme ? "/cl_logo_dark.png" : "/cl_logo.png";
  return (
    <div className="">
      <div className="">
        <div className="mx-auto max-w-[85rem] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <div className="flex justify-center"></div>

          <img src={logoSrc} className="mx-auto mt-4 h-24" alt="" />
          {/* End Title */}

          <div className="mx-auto mt-5 max-w-3xl text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Reskinn Store is your one-stop thrift store for all your thrifting
              needs.
            </p>
          </div>

          {/* Buttons */}

          <div className="mt-5 flex items-center justify-center gap-x-1 sm:gap-x-3">
            <Button>
              <Link href={"/bundles"}>Book a Bundle</Link>
            </Button>
            <Button variant={"outline"}>
              <Link href={"https://instagram.com/re_skinn"}>Shop @ IG</Link>
            </Button>
          </div>
          {/* End Buttons */}

          <div className="prose mx-auto mt-10">
            {/* <h1 className="">Presenting Bundles</h1> */}
            <div>
              <Separator className={"mb-10"} />
              <div className="not-prose w-full rounded-xl border bg-muted shadow-sm  dark:shadow-slate-700/[.7] sm:flex">
                <div className="relative w-full flex-shrink-0 overflow-hidden rounded-t-xl pt-52 sm:max-w-[15rem] sm:rounded-s-xl md:max-w-xs md:rounded-se-none">
                  <img
                    className="absolute start-0 top-0 object-cover"
                    src="/bundles_header_img.jpg"
                    alt="Image Description"
                  />
                </div>
                <div className="flex flex-wrap">
                  <div className="flex h-full flex-col p-4 sm:p-5">
                    <h3 className="not-prose text-lg font-bold text-gray-800 no-underline dark:text-white">
                      Reskinn Bundles
                    </h3>
                    <p className="not-prose mt-1 text-gray-500 no-underline dark:text-gray-400">
                      Book your very own bundle of clothes and accessories that
                      match your style and aesthetic.
                    </p>
                    <Button variant={"link"} className="mt-2 w-fit p-0 text-primary font-semibold ">
                      Book your Bundle
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="mt-5 flex items-center justify-center gap-x-1 sm:gap-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Package Manager:
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              npm
            </span>
            <svg
              className="h-5 w-5 text-gray-300 dark:text-gray-600"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 13L10 3"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
            <a
              className="inline-flex items-center gap-x-1.5 text-sm font-medium text-blue-600 decoration-2 hover:underline"
              href="#"
            >
              Installation Guide
              <svg
                className="h-4 w-4 flex-shrink-0"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M5.27921 2L10.9257 7.64645C11.1209 7.84171 11.1209 8.15829 10.9257 8.35355L5.27921 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}
