import { z } from "zod";

import { AppConfig } from "../../config/app-config";

export const DelhiveryShipmentSchema = z.object({
  name: z.string(),
  add: z.string(),
  pin: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  phone: z.string(),
  order: z.string(),
  payment_mode: z.string().default(AppConfig.DefaultPaymentMode),
  return_pin: z.string().default(""),
  return_city: z.string().default(""),
  return_phone: z.string().default(""),
  return_add: z.string().default(""),
  return_state: z.string().default(""),
  return_country: z.string().default(""),
  products_desc: z.string().default(""),
  hsn_code: z.string().default(""),
  cod_amount: z.string().default("0"),
  order_date: z.date(),
  total_amount: z.string(),
  seller_add: z.string().default(""),
  seller_name: z.string().default(AppConfig.StoreName),
  seller_inv: z.string().default(""),
  quantity: z.string().default(""),
  waybill: z.string().default(""),
  shipment_width: z.string(),
  shipment_height: z.string(),
  weight: z.string(),
  seller_gst_tin: z.string().default(""),
  shipping_mode: z.string().default("Surface"),
  address_type: z.string().default("home"),
});

export const DelhiveryPickupResponseSchema = z.object({
  pickup_id: z.number(),
  pickup_date: z.string(),
  pickup_location: z.string(),
});
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

export const DelhiveryDeliveryCostRequestSchema = z.object({
  delivery_pincode: z.string().length(6),
  origin_pincode: z.string().length(6),
  weight: z.string(),
});

export const DelhiveryPackageCreationRequestSchema = z.object({
  shipments: z.array(DelhiveryShipmentSchema),
  pickup_location: z
    .object({
      name: z.string().default(AppConfig.WarehouseDetails.name),
      add: z
        .string()
        .default(
          `${AppConfig.WarehouseDetails.house_number}, ${AppConfig.WarehouseDetails.locality}`,
        ),
      city: z.string().default(AppConfig.WarehouseDetails.city),
      pin_code: z.string().default(AppConfig.WarehouseDetails.pincode),
      country: z.string().default(AppConfig.WarehouseDetails.country),
      phone: z.string().default(AppConfig.WarehouseDetails.phone_no),
    })
    .default({
      name: AppConfig.WarehouseDetails.name,
      add: `${AppConfig.WarehouseDetails.house_number}, ${AppConfig.WarehouseDetails.locality}`,
      city: AppConfig.WarehouseDetails.city,
      pin_code: AppConfig.WarehouseDetails.pincode,
      country: AppConfig.WarehouseDetails.country,
      phone: AppConfig.WarehouseDetails.phone_no,
    }),
});

export const DelhiveryPackageCreationResponseSchema = z.object({
  cash_pickups: z.number(),
  cash_pickups_count: z.number(),
  cod_amount: z.number(),
  cod_count: z.number(),
  package_count: z.number(),
  packages: z.array(
    z.object({
      client: z.string(),
      cod_amount: z.number(),
      payment: z.string(),
      refnum: z.string(),
      remarks: z.array(z.string()),
      serviceable: z.boolean(),
      sort_code: z.null().or(z.string()), // Allows for null or string
      status: z.string(),
      waybill: z.string(),
    }),
  ),
  pickups_count: z.number(),
  prepaid_count: z.number(),
  replacement_count: z.number(),
  success: z.boolean(),
  upload_wbn: z.string(),
});

export const DelhiveryPickupSuccessResponseSchema = z.object({
  client_name: z.string(),
  expected_package_count: z.string(),
  incoming_center_name: z.string(),
  pickup_date: z.string(),
  pickup_id: z.number(),
  pickup_location_name: z.string(),
  pickup_time: z.string(),
});

export const DelhiveryPickupErrorResponseSchema = z.object({
  status: z.boolean(),
  success: z.boolean(),
  pickup_id: z.number(),
  pr_exist: z.boolean(),
  error: z.object({ message: z.string(), code: z.number() }),
  data: z.object({ message: z.string() }),
});

export const DelhiveryPickupRequestSchema = z.object({
  pickup_location: z.string().default(AppConfig.WarehouseDetails.name),
  expected_package_count: z.number(),
  pickup_date: z.string(),
  order_ids: z.string().uuid().array(),
  pickup_time: z.string().default("13:54:00"),
});

export const DelhiveryTrackingSchema = z.object({
  ShipmentData: z.array(
    z.object({
      Shipment: z.object({
        PickUpDate: z.string(),
        Destination: z.string(),
        DestRecieveDate: z.string().nullish(),
        Scans: z.array(
          z.object({
            ScanDetail: z.object({
              ScanDateTime: z.string(),
              ScanType: z.string(),
              Scan: z.string(),
              StatusDateTime: z.string(),
              ScannedLocation: z.string(),
              Instructions: z.string(),
              StatusCode: z.string(),
            }),
          }),
        ),
        Status: z.object({
          Status: z.string(),
          StatusLocation: z.string(),
          StatusDateTime: z.string(),
          RecievedBy: z.string(),
          Instructions: z.string(),
          StatusType: z.string(),
          StatusCode: z.string(),
        }),
        ReturnPromisedDeliveryDate: z.string().nullish(),
        Ewaybill: z.array(z.unknown()),
        InvoiceAmount: z.number(),
        ChargedWeight: z.number().nullish(),
        PickedupDate: z.string().nullish(),
        DeliveryDate: z.string().nullish(),
        SenderName: z.string(),
        AWB: z.string(),
        DispatchCount: z.number(),
        OrderType: z.string(),
        ReturnedDate: z.string().nullish(),
        ExpectedDeliveryDate: z.string().nullish(),
        RTOStartedDate: z.string().nullish(),
        Extras: z.string(),
        FirstAttemptDate: z.string().nullish(),
        ReverseInTransit: z.boolean(),
        Quantity: z.string(),
        Origin: z.string(),
        Consignee: z.object({
          City: z.string(),
          Name: z.string(),
          Country: z.string(),
          Address2: z.array(z.unknown()),
          Address3: z.string(),
          PinCode: z.number(),
          State: z.string(),
          Telephone2: z.string(),
          Telephone1: z.string(),
          Address1: z.array(z.unknown()),
        }),
        ReferenceNo: z.string(),
        OutDestinationDate: z.string().nullish(),
        CODAmount: z.number(),
        PromisedDeliveryDate: z.string().nullish(),
        PickupLocation: z.string(),
        OriginRecieveDate: z.string().nullish(),
      }),
    }),
  ),
});
