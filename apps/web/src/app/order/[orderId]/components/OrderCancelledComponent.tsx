import Link from "next/link";

import { Button } from "@gramflow/ui";
import { AppConfig } from "@gramflow/utils";

export default function OrderCancelledComponent() {
  return (
    <div
      className={
        "mx-auto flex max-w-md flex-col space-y-4 animate-in fade-in duration-200"
      }
    >
      <h1 className="bg-gradient-to-br from-black via-[#171717] to-[#4b4b4b] bg-clip-text pt-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-5xl">
        Reach Out To Us
      </h1>
      <p className={"text-center text-sm text-muted-foreground"}>
        Please message us on Instagram and let us know the issue. We will try
        our best to resolve your query as soon as possible.
      </p>
      <Link href={`https://instagram.com/${AppConfig.InstagramUsername}`}>
        <Button className={"w-full"}>Reach Out</Button>
      </Link>
    </div>
  );
}
