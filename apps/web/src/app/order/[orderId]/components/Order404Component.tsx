import Link from "next/link";

import { Button } from "@acme/ui";
import { AppConfig } from "@acme/utils";

export default function Order404Component() {
  return (
    <section className="bg-white dark:bg-gray-900 ">
      <div className="container mx-auto flex min-h-screen items-center px-6 py-12">
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
          <p className="rounded-full bg-pink-50 p-3 text-sm font-medium text-pink-500 dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
            Order not Found
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            The order you are looking for doesn&apos;t exist.
          </p>

          <div className="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <Link
              href={AppConfig.BaseStoreUrl}
              className="hidden px-4 py-2 text-sm text-gray-600 hover:text-gray-900 md:inline-block"
            >
              <Button>Shop on Instagram</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
