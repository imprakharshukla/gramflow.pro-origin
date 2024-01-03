import * as z from "zod"

export const OtpModel = z.object({
  id: z.string(),
  email: z.string(),
  otp: z.string(),
  order_id: z.string(),
  bundle_id: z.string(),
  expires: z.date(),
})
