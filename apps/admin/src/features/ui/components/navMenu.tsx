import { AppConfig } from "@gramflow/utils";

export default function NavMenu() {
  return (
    <nav className="fixed left-0 top-0 z-20 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center p-4">
        <a href={AppConfig.BaseStoreUrl} className="flex items-center">
          <img src="/cl_logo.svg" className="mr-3 h-12" alt="Logo" />
        </a>
      </div>
    </nav>
  );
}
