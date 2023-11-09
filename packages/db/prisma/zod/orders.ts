import * as z from "zod"
import { Status, COURIER } from "@prisma/client"
import { CompleteUsers, RelatedUsersModel } from "./index"

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
  shipping_cost: z.number().int().nullish(),
})

export interface CompleteOrders extends z.infer<typeof OrdersModel> {
  user?: CompleteUsers | null
}

/**
 * RelatedOrdersModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedOrdersModel: z.ZodSchema<CompleteOrders> = z.lazy(() => OrdersModel.extend({
  user: RelatedUsersModel.nullish(),
}))
