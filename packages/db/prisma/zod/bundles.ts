import * as z from "zod"
import { Status } from "@prisma/client"
import { CompleteUsers, RelatedUsersModel, CompleteOrders, RelatedOrdersModel } from "./index"

export const BundlesModel = z.object({
  id: z.string(),
  bundle_size: z.string(),
  aesthetics: z.string(),
  other_aesthetics: z.string().nullish(),
  fashion_dislikes: z.string().nullish(),
  link_input: z.string(),
  bundle_description: z.string(),
  top_size: z.string(),
  waist: z.string(),
  length: z.string(),
  status: z.nativeEnum(Status),
  user_id: z.string().nullish(),
  images: z.string().array(),
  created_at: z.date(),
  updated_at: z.date(),
})

export interface CompleteBundles extends z.infer<typeof BundlesModel> {
  user?: CompleteUsers | null
  Orders?: CompleteOrders | null
}

/**
 * RelatedBundlesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedBundlesModel: z.ZodSchema<CompleteBundles> = z.lazy(() => BundlesModel.extend({
  user: RelatedUsersModel.nullish(),
  Orders: RelatedOrdersModel.nullish(),
}))
