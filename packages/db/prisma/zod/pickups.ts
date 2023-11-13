import * as z from "zod"
import { CompleteOrders, RelatedOrdersModel } from "./index"

export const PickupsModel = z.object({
  id: z.string(),
  pickup_id: z.number().int(),
  pickup_location: z.string(),
  pickup_date: z.date(),
  order_id: z.string().array(),
  ordersId: z.string().nullish(),
})

export interface CompletePickups extends z.infer<typeof PickupsModel> {
  Orders?: CompleteOrders | null
}

/**
 * RelatedPickupsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPickupsModel: z.ZodSchema<CompletePickups> = z.lazy(() => PickupsModel.extend({
  Orders: RelatedOrdersModel.nullish(),
}))
