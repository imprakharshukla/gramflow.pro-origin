/**
 * @ jest-environment node
 */

import type { PageConfig } from "next";
import { testApiHandler } from "next-test-api-route-handler";

import { env } from "~/env.mjs";
// Import the handler under test from the pages/api directory
// import { GET, PUT } from "../app/api/admin/route";
import { GET as getReqStatus } from "../app/api/status/route";

// Respect the Next.js config object if it's exported
const getReqHandler: typeof getReqStatus & { config?: PageConfig } =
  getReqStatus;

  
it("does what I want", async () => {
  await testApiHandler({
    handler: getReqHandler,
    test: async ({ fetch }) => {
      const res = await fetch({ method: "GET" });
      console.log(env.DIRECT_URL);
      await expect(res.json()).resolves.toStrictEqual({ response: "OK" });
    },
  });
});
