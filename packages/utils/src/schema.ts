import { COURIER, Status } from "@prisma/client";
import { z } from "zod";

export const AddOrderPostSchema = z.object({
  instagram_post_urls: z.string().array(),
  prebook: z.boolean().default(false),
  bundle_id: z.string().optional(),
  images: z.string().array().optional(),
  size: z.object({
    length: z.string(),
    breadth: z.string(),
    height: z.string(),
    weight: z.string(),
  }),
});

export const bundleFormSchema = z.object({
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

export const OrderPageOrderFetchSchema = z.object({
  bundle_id: z.string().nullable(),
  id: z.string().uuid(),
  images: z.string().array(),
  awb: z.string().nullish(),
  status: z.nativeEnum(Status),
});

export const OrderPageOrderFetchSchemas = z.object({
  bundle_id: z.string().nullable(),
  id: z.string().uuid(),
  price: z.number(),
  images: z.string().array(),
  instagram_post_urls: z.string().array(),
  awb: z.string().nullish(),
  status: z.nativeEnum(Status),
});

export const UpdateUserPutSchema = z.object({
  name: z.string(),
  id: z.string().uuid(),
  house_number: z.string(),
  locality: z.string(),
  state: z.string(),
  pincode: z.string(),
  city: z.string(),
  instagram_username: z.string(),
  landmark: z.string().nullish(),
  country: z.string(),
  email: z.string(),
  phone_no: z.string(),
});

export const UserSchema = UpdateUserPutSchema.omit({
  id: true,
});

export const UpdateOrderPutSchema = z.object({
  order_ids: z.string().array(),
  status: z.nativeEnum(Status),
  delete: z.boolean().optional(),
});

export const UpdateOrderWeightAndSizePutSchema = z.object({
  awb: z.string().optional(),
  courier: z.nativeEnum(COURIER).optional(),
  status: z.nativeEnum(Status).optional(),
  length: z.string().optional(),
  breadth: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
});

export const UpdateBundlePutSchema = z.object({
  status: z.nativeEnum(Status).optional(),
});

export const OrderShippingUpdateSchema = z.object({
  awb: z.string(),
  courier: z.nativeEnum(COURIER),
  status: z.nativeEnum(Status),
  length: z.string(),
  breadth: z.string(),
  height: z.string(),
  weight: z.string(),
});

const ShippingAddressSchema = z.object({});

const BillingAddressSchema = ShippingAddressSchema.extend({});

export const OrderSchemaCSV = z.object({
  "Sale Order Number": z.string(),
  "Pickup Location Name": z.string(),
  "Transport Mode": z.enum(["Express", "Surface"]),
  "Payment Mode": z.enum(["Prepaid", "COD"]),
  "COD Amount": z.string().optional(),
  "Customer Name": z.string(),
  "Customer Phone": z.string(),
  "Shipping Address Line1": z.string(),
  "Shipping Address Line2": z.string().optional(),
  "Shipping City": z.string(),
  "Shipping State": z.string(),
  "Shipping Pincode": z.string(),
  "Item Sku Code": z.string(),
  "Item Sku Name": z.string(),
  "Quantity Ordered": z.string().default("1"),
  "Unit Item Price": z.string().default("100"),
  "Length (cm)": z.string().default("25"),
  "Breadth (cm)": z.string().default("20"),
  "Height (cm)": z.string().default("5"),
  "Weight (gm)": z.string().default("500"),
  "Fragile Shipment": z.enum(["Yes", "No"]).default("No"),
  "Discount Type": z.string().optional(),
  "Discount Value": z.string().optional(),
  "Tax Class Code": z.string().optional(),
  "Customer Email": z.string().optional(),
  "Billing Address same as Shipping Address": z
    .enum(["Yes", "No"])
    .default("Yes"),
  "Billing Address Line1": z.string().optional(),
  "Billing Address Line2": z.string().optional(),
  "Billing City": z.string().optional(),
  "Billing State": z.string().optional(),
  "Billing Pincode": z.string().optional(),
  "e-Way Bill Number": z.string().optional(),
  "Seller Name": z.string().optional(),
  "Seller GST Number": z.string().optional(),
  "Seller Address Line1": z.string().optional(),
  "Seller Address Line2": z.string().optional(),
});

export const CSVSchema = z.array(OrderSchemaCSV);

export const ShippingCostResponseSchema = z.array(
  z.object({
    charge_ROV: z.number(),
    charge_REATTEMPT: z.number(),
    charge_RTO: z.number(),
    charge_MPS: z.number(),
    charge_pickup: z.number(),
    charge_CWH: z.number(),
    tax_data: z.object({
      swacch_bharat_tax: z.number(),
      IGST: z.number(),
      SGST: z.number(),
      service_tax: z.number(),
      krishi_kalyan_cess: z.number(),
      CGST: z.number(),
    }),
    charge_DEMUR: z.number(),
    charge_AWB: z.number(),
    zone: z.string(),
    wt_rule_id: z.null(),
    charge_AIR: z.number(),
    charge_FSC: z.number(),
    charge_LABEL: z.number(),
    charge_COD: z.number(),
    status: z.string(),
    charge_POD: z.number(),
    adhoc_data: z.object({}),
    charge_CCOD: z.number(),
    gross_amount: z.number(),
    charge_DTO: z.number(),
    charge_COVID: z.number(),
    zonal_cl: z.null(),
    charge_DL: z.number(),
    total_amount: z.number(),
    charge_DPH: z.number(),
    charge_FOD: z.number(),
    charge_DOCUMENT: z.number(),
    charge_WOD: z.number(),
    charge_INS: z.number(),
    charge_FS: z.number(),
    charge_CNC: z.number(),
    charge_FOV: z.number(),
    charge_QC: z.number(),
    charged_weight: z.number(),
  }),
);
