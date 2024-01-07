"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card, Label, Loader, Switch } from "@gramflow/ui";

export const BundleSwitch = ({
  areBundlesAvailable,
}: {
  areBundlesAvailable: boolean;
}) => {
  const [areBundlesAvail, setAreBundlesAvail] =
    useState<boolean>(areBundlesAvailable);

  const [loading, setLoading] = useState<boolean>(false);

  const setBundles = async () => {
    setLoading(true);
    const req = await fetch(
      `/api/bundle?bundles_enabled=${areBundlesAvail ? "false" : "true"}`,
      {
        method: "OPTIONS",
      },
    );
    if (!req.ok) {
      toast.error("Failed to update bundles");
    } else {
      toast.success("Bundles updated");
    }
    setLoading(false);
  };

  return (
    <Card className={"-mb-2 cursor-pointer border p-3 text-sm md:w-fit"}>
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="airplane-mode">Enable Bundles</Label>
        {loading ? (
          <Loader />
        ) : (
          <Switch
            checked={areBundlesAvail}
            onCheckedChange={(checked: boolean) => {
              setAreBundlesAvail(checked);
              setBundles();
            }}
          />
        )}
      </div>
    </Card>
  );
};
