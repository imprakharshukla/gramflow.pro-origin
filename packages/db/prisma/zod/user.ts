import * as z from "zod"
import { CompleteSession, RelatedSessionModel, CompleteAddress, RelatedAddressModel, CompleteOrders, RelatedOrdersModel, CompleteBundles, RelatedBundlesModel } from "./index"

export const UserModel = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  emailVerified: z.date().nullish(),
  image: z.string().nullish(),
  created_at: z.date(),
  updated_at: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  sessions: CompleteSession[]
  addresses: CompleteAddress[]
  orders: CompleteOrders[]
  bundles: CompleteBundles[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  sessions: RelatedSessionModel.array(),
  addresses: RelatedAddressModel.array(),
  orders: RelatedOrdersModel.array(),
  bundles: RelatedBundlesModel.array(),
}))
