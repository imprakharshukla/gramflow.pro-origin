import React from "react";

import BundleForm from "./components/bundleForm";

export default async function BundlePage() {
  return (
    <div className="mt-5">
      <div className="prose prose dark:prose-invert container">
        <BundleForm />
      </div>
    </div>
  );
}
