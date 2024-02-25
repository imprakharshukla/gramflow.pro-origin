import { format } from "date-fns";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import { z } from "zod";

import { Orders, Users, db } from "@gramflow/db";

import {
  DelhiveryDeliveryCostRequestSchema,
  DelhiveryPackageCreationRequestSchema,
  DelhiveryPackageCreationResponseSchema,
  DelhiveryPickupRequestSchema,
  DelhiveryPickupResponseSchema,
  DelhiveryPickupSuccessResponseSchema,
  DelhiveryShipmentSchema,
  ShippingCostResponseSchema,
} from "../api/schema/delhivery";
import { env } from "../config";
import { AppConfig } from "../config/app-config";
import { ShippingService } from "../interfaces/IShipping";

const fetch = require("node-fetch");
const FetchResponse = fetch.Response;

type DelhiveryShipment = z.infer<typeof DelhiveryShipmentSchema>;
type DelhiveryPickupRequest = z.infer<typeof DelhiveryPickupRequestSchema>;

@Service()
export default class DelhiveryService implements ShippingService {
  constructor(@Inject("logger") private logger: Logger) {}
  public async createShipmemt(
    orders: (Orders & { user: Users | null })[],
  ): Promise<z.infer<typeof DelhiveryPackageCreationResponseSchema>> {
    const shipments: DelhiveryShipment[] = [];
    orders.map((order) => {
      const shipment = DelhiveryShipmentSchema.parse({
        order: order.id,
        order_date: order.created_at,
        name: order.user?.name,
        add: `${order.user?.house_number}, ${order.user?.locality}`,
        pin: order.user?.pincode,
        country: order.user?.country,
        state: order.user?.state,
        city: order.user?.city,
        total_amount: order.price.toString(),
        phone: order.user?.phone_no,
        shipment_width: order.breadth,
        shipment_length: order.length,
        shipment_height: order.height,
      });
      shipments.push(shipment);
      this.logger.info(`Shipment queued for order: ${order.id}`);
    });

    const packageCreationData = DelhiveryPackageCreationRequestSchema.parse({
      shipments: shipments,
    });

    const requestOptions = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${env.DELHIVERY_API_KEY}`,
      }),
      body: "format=json&data=" + JSON.stringify(packageCreationData),
    };

    const response = await fetch(
      env.isDev
        ? "https://staging-express.delhivery.com/api/cmu/create.json"
        : "https://track.delhivery.com/api/cmu/create.json",
      requestOptions,
    );

    if (!response.ok) {
      throw new Error("Failed to create orders");
    }

    try {
      const res = await response.json();
      console.log({ res: JSON.stringify(res) });
      return DelhiveryPackageCreationResponseSchema.parse(res);
    } catch (e) {
      console.log({ validationError: e });
      throw new Error("Error validating response");
    }
  }
  public async getPickup(
    date: string,
  ): Promise<z.infer<typeof DelhiveryPickupResponseSchema> | null> {
    return db.pickups.findFirst({
      where: {
        pickup_date: format(new Date(Number(date)), "yyyy-MM-dd"),
      },
    });
  }
  public async createPickup(
    pickupRequestData: DelhiveryPickupRequest,
  ): Promise<z.infer<typeof DelhiveryPickupResponseSchema>> {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${env.DELHIVERY_API_KEY}`,
        },
        body: JSON.stringify({
          pickup_location: AppConfig.WarehouseDetails.name,
          expected_package_count:
            pickupRequestData.expected_package_count.toString(),
          pickup_date: format(
            new Date(pickupRequestData.pickup_date),
            "yyyy-MM-dd",
          ).toString(),
          pickup_time: pickupRequestData.pickup_time,
        }),
      };
      console.log(JSON.stringify(options));
      const pickupResponse = await fetch(
        "https://track.delhivery.com/fm/request/new/",
        options,
      );
      if (pickupResponse.ok) {
        console.log({ status: pickupResponse.status });

        const text = await pickupResponse.text();
        this.logger.error(
          "Error while requesting pickup from Delhivery. ",
          text,
        );
        throw new Error(`Error requesting pickup: ${text}`);
      }
      const json = await pickupResponse.json();
      const validated = DelhiveryPickupSuccessResponseSchema.parse(json);
      await db.pickups.upsert({
        where: {
          pickup_id: validated.pickup_id,
        },
        update: {
          pickup_location: pickupRequestData.pickup_location,
          order_id: pickupRequestData.order_ids,
          pickup_date: format(
            new Date(validated.pickup_date),
            "yyyy-MM-dd",
          ).toString(),
        },
        create: {
          pickup_id: validated.pickup_id,
          pickup_location: pickupRequestData.pickup_location,
          order_id: pickupRequestData.order_ids,
          pickup_date: format(
            new Date(validated.pickup_date),
            "yyyy-MM-dd",
          ).toString(),
        },
      });

      return {
        pickup_id: validated.pickup_id,
        pickup_location: pickupRequestData.pickup_location,
        pickup_date: format(
          new Date(pickupRequestData.pickup_date),
          "yyyy-MM-dd",
        ).toString(),
      };
    } catch (e) {
      throw new Error("Error requesting pickup ");
    }
  }
  public async calculateShippingCost(
    details: z.infer<typeof DelhiveryDeliveryCostRequestSchema>,
  ): Promise<number> {
    try {
      const options = {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${env.DELHIVERY_API_KEY}`,
        },
      };
      const url = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${details.delivery_pincode}&o_pin=${details.origin_pincode}&cgm=${details.weight}&pt=Pre-paid&cod=0`;

      const response = await fetch(url, options);
      if (!response.ok) {
        console.log("Error while requesting shipping data from Delhivery.", {
          response: JSON.stringify(response),
        });
        throw new Error("Error generating shipping cost.");
      }
      const json = await response.json();
      const validated = ShippingCostResponseSchema.parse(json);

      if (!validated[0] || !validated[0]?.total_amount) {
        this.logger.error(
          "Error while validating shipping response from Delhivery.",
          {
            response: JSON.stringify(response),
          },
        );
        throw new Error("Error validating shipping cost");
      }
      return validated[0]?.total_amount;
    } catch (e) {
      throw new Error("Error generating shipping cost.");
    }
  }
}
