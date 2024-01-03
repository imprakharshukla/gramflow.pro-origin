// import type { PageConfig } from "next";
// import { testApiHandler } from "next-test-api-route-handler";

// import {
//   GET as getReqAdmin,
//   PUT as putReqAdmin,
// } from "../../app/api/admin/route";
// import { prisma } from "../../lib/prismaClient";
// import { orderSeedData, userSeedData } from "../testUtils/seedData";

// beforeEach(async () => {
//   await prisma.users.create({
//     data: userSeedData,
//   });
//   await prisma.orders.create({
//     data: orderSeedData,
//   });
// });

// afterEach(async () => {
//   await prisma.users.deleteMany();
//   await prisma.users.deleteMany();
// });

// // Respect the Next.js config object if it's exported
// const getReqHandler: typeof getReqAdmin & { config?: PageConfig } = getReqAdmin;
// const putReqHandler: typeof putReqAdmin & { config?: PageConfig } = putReqAdmin;

// describe("admin api", () => {
//   it("should return 401 unauthorized", async () => {
//     await testApiHandler({
//       handler: getReqHandler,
//       test: async ({ fetch }) => {
//         const res = await fetch({ method: "GET" });
//         await expect(res.status).resolves.toStrictEqual(401);
//       },
//     });
//   });
// });
