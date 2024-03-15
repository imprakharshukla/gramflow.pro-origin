import * as z from "zod"
import { USER_ROLE } from "@prisma/client"
import { CompleteOrders, RelatedOrdersModel, CompleteBundles, RelatedBundlesModel, CompleteAccount, RelatedAccountModel, CompleteSession, RelatedSessionModel } from "./index"

export const UsersModel = z.object({
  id: z.string().uuid(),
  name: z.string().nullish(),
  email: z.string(),
  house_number: z.string().nullish(),
  pincode: z.string().max(6).min(6).nullish(),
  landmark: z.string().nullish(),
  locality: z.string().nullish(),
  instagram_username: z.string().nullish(),
  city: z.string().nullish(),
  role: z.nativeEnum(USER_ROLE),
  state: z.string().nullish(),
  country: z.string().nullish(),
  phone_no: z.string().max(10).min(10).nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  emailVerified: z.date().nullish(),
  image: z.string().nullish(),
})

export interface CompleteUsers extends z.infer<typeof UsersModel> {
  orders: CompleteOrders[]
  Bundles: CompleteBundles[]
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
}

/**
 * RelatedUsersModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUsersModel: z.ZodSchema<CompleteUsers> = z.lazy(() => UsersModel.extend({
  orders: RelatedOrdersModel.array(),
  Bundles: RelatedBundlesModel.array(),
  accounts: RelatedAccountModel.array(),
  sessions: RelatedSessionModel.array(),
}))
