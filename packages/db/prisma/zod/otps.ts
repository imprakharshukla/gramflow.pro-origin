import * as z from "zod"

export const OtpsModel = z.object({
  id: z.string(),
  email: z.string(),
  otp: z.string(),
  expires: z.date(),
})
