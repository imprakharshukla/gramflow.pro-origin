import { z } from "zod";

// Define Zod schema
const OrderInputZodSchema = z.object({
  instagram_post_urls: z.array(z.string()),
  prebook: z.boolean().default(false),
  bundle_id: z.string().optional(),
  images: z.array(z.string()).optional(),
  size: z.object({
    length: z.string(),
    breadth: z.string(),
    height: z.string(),
    weight: z.string(),
  }),
});

type OrderInput = z.infer<typeof OrderInputZodSchema>;
export interface IOrderInputDTO extends OrderInput {}

export { OrderInputZodSchema };
