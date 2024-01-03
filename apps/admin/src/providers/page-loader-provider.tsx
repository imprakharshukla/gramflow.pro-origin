"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export const PageLoaderProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#1C2638"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};
