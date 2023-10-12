import {z} from "zod";

export const orderDetailsSchema = z.object({
  order_type: z.string(),
  order_number: z.string(),
  sub_order_number: z.string().nullable(),
  phy_weight: z.string().optional(),  // Marked as optional
  net_payment: z.string().optional(),  // Marked as optional
  ship_length: z.string().optional(),  // Marked as optional
  ship_width: z.string().optional(),  // Marked as optional
  ship_height: z.string().optional(),  // Marked as optional
});

export const customerDetailsSchema = z.object({
  customer_name: z.string(),
  customer_address1: z.string(),
  customer_address2: z.string().nullable(),
  customer_address3: z.string().nullable(),
  customer_city: z.string(),
  customer_state: z.string(),
  customer_country: z.string(),
  customer_pincode: z.string(),
  customer_mobile: z.string(),
  customer_phone: z.string().nullable(),
});

export const scanDetailSchema = z.object({
  status_code: z.string(),
  status: z.string(),
  status_date_time: z.string(),
  status_location: z.string(),
  status_remark: z.string(),
});

export const trackingImportantDetailsSchema = z.object({
  message: z.string(),
  awb_no: z.string(),
  logistic: z.string(),
  order_type: z.string(),
  cancel_status: z.string(),
  current_status: z.string(),
  current_status_code: z.string(),
  ofd_count: z.string().optional(),  // Marked as optional
  return_tracking_no: z.string().optional(),  // Marked as optional
  expected_delivery_date: z.string().optional(),  // Marked as optional
  promise_delivery_date: z.string().optional(),  // Marked as optional
  order_details: orderDetailsSchema,
  order_date_time: z.object({
    manifest_date_time: z.string(),
    pickup_date: z.string(),
    delivery_date: z.string().optional(),  // Marked as optional
    rto_delivered_date: z.string().optional(),  // Marked as optional
  }),
  customer_details: customerDetailsSchema,
  last_scan_details: z.object({
    status_code: z.string(),
    status: z.string(),
    status_date_time: z.string(),
    scan_location: z.string(),
    remark: z.string(),
  }),
  scan_details: z.array(scanDetailSchema),
})

export const trackingMainResponseSchema = z.object({
  status: z.string(),
  status_code: z.number(),
  data: z.record(trackingImportantDetailsSchema)

});

export const trackingRequestSchema = z.object({
  data: z.object({
    awb_number_list: z.string(),
    access_token: z.string(),
    secret_key: z.string(),
  }),
});
