import { z } from "zod";

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