import { z } from "zod";

// Define Zod schema
const BundleInputZodSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  otp: z.string(),
  phoneNumber: z
    .string()
    .min(10)
    .max(10)
    .refine((value) => /^\d+$/.test(value)),
  instagramUsername: z
    .string()
    .min(1)
    .refine((value) => value.replace("@", "")),
  bundleSize: z.enum([
    "extra_small",
    "small",
    "medium",
    "large",
    "extra_large",
  ]),
  topSize: z.enum(["xs", "s", "m", "l", "xl"]),
  bottomSize: z.object({
    waist: z.string(),
    length: z.string(),
  }),
  aesthetics: z.enum([
    "y2k/2000s",
    "coastal_cowboy/boho",
    "60s/70s",
    "90s_(ex/_friends_&_full_house)",
    "sporty_model_off_duty",
    "coquette_dainty",
    "streetwear",
    "cozy_simple_fall/winter",
    "witchy_whimsical",
    "late_90s/early_2000s",
    "other",
  ]),
  pictures: z.string().array().optional(),
  otherAesthetic: z.string().optional(),
  fashionDislikes: z.string().optional(),
  linkInput: z.string().url(),
  bundleDescription: z.string(),
});


type OrderInput = z.infer<typeof BundleInputZodSchema>;
export interface IOrderInputDTO extends OrderInput { }

export { BundleInputZodSchema };