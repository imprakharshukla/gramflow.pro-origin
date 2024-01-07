"use client";

import React, { useEffect, useState } from "react";
import { Facebook, Instagram, InstagramIcon, Twitter } from "lucide-react";
import { useTheme } from "next-themes";

const Footer = () => {
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
    <footer className="mx-auto w-full max-w-[85rem] bg-secondary py-10 px-4 sm:px-6 lg:px-8">
      {/* Grid */}
      <div className="grid grid-cols-1 items-center gap-5 text-center md:grid-cols-3">
        <div>
          {/* <a
            className="flex-none text-xl font-semibold  dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
            href="#"
            aria-label="Brand"
          >
            Brand
          </a> */}
          <img src={logoSrc} className="mx-auto mt-4 h-16" alt="" />
        </div>
        {/* End Col */}

        <ul className="text-center font-sans">
          <li className="pe-8 last:pe-0 before:end-3 relative inline-block before:absolute before:top-1/2 before:-translate-y-1/2 before:text-gray-300 before:content-['/'] last-of-type:before:hidden dark:before:text-gray-600">
            <a
              className="inline-flex gap-x-2 font-sans dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              href="/bundles"
            >
              Bundles
            </a>
          </li>
          <li className="pe-8 last:pe-0 before:end-3 relative inline-block before:absolute before:top-1/2 before:-translate-y-1/2 before:text-gray-300 before:content-['/'] last-of-type:before:hidden dark:before:text-gray-600">
          <a
              className="inline-flex gap-x-2 font-sans dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              href="https://instagram.com/re_skinn"
            >
              Instagram Store
            </a>
          </li>
        </ul>
        {/* End Col */}

        {/* Social Brands */}
        <div className="space-x-2 md:text-end">
          <a
            className="inline-flex h-8 w-8 items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold disabled:pointer-events-none disabled:opacity-50 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
            href="https://instagram.com/re_skinn"
          >
            <InstagramIcon />
          </a>
        </div>
        {/* End Social Brands */}
      </div>
      {/* End Grid */}
    </footer>
  );
};

export default Footer;
