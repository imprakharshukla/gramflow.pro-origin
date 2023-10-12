import Link from "next/link";

import { AppConfig } from "@acme/utils";

export default function AuthNavMenu() {
  return (
    <nav className="fixed left-0 top-0 z-20 w-full">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link href={AppConfig.BaseAdminUrl} className="flex items-center">
          <img src="/cl_logo.svg" className="mr-3 h-12" alt="Logo" />
          <p className="py-1 text-xs font-light">Powered By Gramflow</p>
        </Link>
        <div className={"p-3"}></div>
      </div>
    </nav>
  );
}
