import * as z from "zod"
import { CompleteUsers, RelatedUsersModel, CompleteUser, RelatedUserModel } from "./index"

export const AddressModel = z.object({
  id: z.string(),
  user_id: z.string(),
  house_number: z.string(),
  pincode: z.string(),
  landmark: z.string(),
  locality: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  phone_no: z.string(),
  userId: z.string().nullish(),
})

export interface CompleteAddress extends z.infer<typeof AddressModel> {
  user: CompleteUsers
  User?: CompleteUser | null
}

/**
 * RelatedAddressModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAddressModel: z.ZodSchema<CompleteAddress> = z.lazy(() => AddressModel.extend({
  user: RelatedUsersModel,
  User: RelatedUserModel.nullish(),
}))
