import * as z from "zod"
import { CompleteOrders, RelatedOrdersModel } from "./index"

export const UsersModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  house_number: z.string(),
  pincode: z.string().max(6).min(6),
  landmark: z.string().nullish(),
  locality: z.string(),
  instagram_username: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  phone_no: z.string().max(10).min(10),
  created_at: z.date(),
  updated_at: z.date(),
})

export interface CompleteUsers extends z.infer<typeof UsersModel> {
  orders: CompleteOrders[]
}

/**
 * RelatedUsersModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUsersModel: z.ZodSchema<CompleteUsers> = z.lazy(() => UsersModel.extend({
  orders: RelatedOrdersModel.array(),
}))
