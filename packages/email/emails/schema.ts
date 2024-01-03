import { z } from "zod";

export const OrderEmailSchema = z.object({
  name: z.string().default("John Doe"),
  house_number: z.string().default("35"),
  pincode: z.string().default("242255"),
  landmark: z.string().default("New Hospital"),
  locality: z.string().default("Skymark Avenue"),
  city: z.string().default("New York"),
  state: z.string().default("New York City"),
  country: z.string().default("USA"),
});
