import { COURIER, Status } from "@prisma/client";
import { z } from "zod";

export const AddOrderPostSchema = z.object({
  instagram_post_urls: z.string().array(),
  prebook: z.boolean().default(false),
  images: z.string().array().optional(),
  size: z.object({
    length: z.string(),
    breadth: z.string(),
    height: z.string(),
    weight: z.string(),
  }),
});



export const OrderPageOrderFetchSchema = z.object({
  id: z.string().uuid(),
  images: z.string().array(),
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
