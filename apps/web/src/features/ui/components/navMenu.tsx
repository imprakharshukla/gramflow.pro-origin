
export default function NavMenu({ className }: { className?: string }) {
  return (
    <nav
      className={`fixed left-0 top-0 z-20 w-full border-b border-gray-200 bg-white`}
    >
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <a href="https://image-link.com">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cl_logo.svg" className="mr-3 h-12" alt="Logo" />
          </a>

          <p className="mt-2 text-xs font-light hover:underline">
            Powered By{" "}
            <a
              href="https://text-link.com"
              className="font-bold text-blue-600  dark:text-blue-400"
            >
              GramFlow
            </a>
          </p>
        </div>
      </div>
    </nav>
  );
}
