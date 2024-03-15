import * as z from "zod"
import { Status, COURIER } from "@prisma/client"
import { CompleteUsers, RelatedUsersModel, CompletePickups, RelatedPickupsModel, CompleteBundles, RelatedBundlesModel } from "./index"

export const OrdersModel = z.object({
  id: z.string().uuid(),
  instagram_post_urls: z.string().array(),
  user_id: z.string().nullish(),
  price: z.number().int(),
  status: z.nativeEnum(Status),
  prebook: z.boolean(),
  courier: z.nativeEnum(COURIER),
  images: z.string().array(),
  awb: z.string().nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  length: z.string().nullish(),
  breadth: z.string().nullish(),
  height: z.string().nullish(),
  weight: z.string().nullish(),
  shipping_cost: z.number().nullish(),
  pickup_id: z.string().nullish(),
  bundle_id: z.string().nullish(),
})

export interface CompleteOrders extends z.infer<typeof OrdersModel> {
  user?: CompleteUsers | null
  pickup?: CompletePickups | null
  bundles?: CompleteBundles | null
}

/**
 * RelatedOrdersModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedOrdersModel: z.ZodSchema<CompleteOrders> = z.lazy(() => OrdersModel.extend({
  user: RelatedUsersModel.nullish(),
  pickup: RelatedPickupsModel.nullish(),
  bundles: RelatedBundlesModel.nullish(),
}))
