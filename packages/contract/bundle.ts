import { initContract } from "@ts-rest/core";
import { z } from "zod";
const c = initContract();
import { BundleInputZodSchema } from "../../apps/backend/src/interfaces/IBundle";
import { BundlesModel, CompleteBundles } from "@gramflow/db/prisma/zod";
export const bundleContract = c.router({
    createBundle: {
        method: "POST",
        path: "/bundle",
        responses: {
            200: BundlesModel,
            400: z.string()
        },
        body: z.object({
            bundle: BundleInputZodSchema
        }),
        summary: "Create a bundle"
    },
    acceptBundle: {
        method: "POST",
        path: "/bundle/accept",
        responses: {
            200: z.string(),
            400: z.string()
        },
        body: z.object({
            id: z.string(),
            price: z.string()
        }),
        summary: "Accept a bundle"
    },
    deleteBundles: {
        method: "DELETE",
        path: "/bundle",
        responses: {
            200: z.string(),
            400: z.string()
        },
        query: z.object({
            bundle_ids: z.string()
        }),
        body: z.object({}),
        summary: "Delete bundles"
    }
})