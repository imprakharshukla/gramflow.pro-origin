import { format } from "date-fns";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import { z } from "zod";

import { Orders, Status, Users, db } from "@gramflow/db";

import order from "../api/routes/order";
import {
  DelhiveryDeliveryCostRequestSchema,
  DelhiveryPackageCreationRequestSchema,
  DelhiveryPackageCreationResponseSchema,
  DelhiveryPickupRequestSchema,
  DelhiveryPickupResponseSchema,
  DelhiveryPickupSuccessResponseSchema,
  DelhiveryShipmentSchema,
  DelhiveryTrackingSchema,
  ShippingCostResponseSchema,
} from "../api/schema/delhivery";
import { env } from "../config";
import { AppConfig } from "../config/app-config";
import { ShippingService } from "../interfaces/IShipping";

const fetch = require("node-fetch");
type DelhiveryShipment = z.infer<typeof DelhiveryShipmentSchema>;
type DelhiveryPickupRequest = z.infer<typeof DelhiveryPickupRequestSchema>;

@Service()
export default class DelhiveryService implements ShippingService {
  constructor(@Inject("logger") private logger: Logger) { }

  public async syncOrdersWithDelhivery(
    orders: (Orders & { user: Users | null })[],
  ) {
    this.logger.info("Syncing orders with Delhivery", {
      orders: orders.map((order) => order.id),
    });
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${env.DELHIVERY_API_KEY}`,
        "Content-Type": "text/plain; charset=utf-8",
      },
    };
    try {
      const response = await fetch(
        `https://track.delhivery.com/api/v1/packages/json/?ref_ids=${orders
          .map((order) => order.id)
          .join(",")}`,
        options,
      );
      const responseData = await response.json();
      if (responseData && responseData.ShipmentData) {
        const validated = DelhiveryTrackingSchema.parse(responseData);
        this.logger.info({ validated: JSON.stringify(validated) });
        const shipments = validated.ShipmentData;
        shipments.forEach(async (shipment) => {
          const status = shipment.Shipment.Status.Status;
          const order_id = shipment.Shipment.ReferenceNo;
          let statusToBeUpdated;
          if (status === "Delivered") {
            statusToBeUpdated = Status.DELIVERED;
          } else if (status === "In Transit") {
            statusToBeUpdated = Status.SHIPPED;
          } else if (status === "Manifested") {
            statusToBeUpdated = Status.MANIFESTED;
          } else if (
            status === "Dispatched" &&
            shipment.Shipment.Status.Instructions === "Out for delivery"
          ) {
            statusToBeUpdated = Status.OUT_FOR_DELIVERY;
          }

          //check if the order already has the status
          if (!statusToBeUpdated) {
            this.logger.info(
              `The order ${order_id} has no status to be updated`,
            );
          } else if (
            statusToBeUpdated ===
            orders.find((order) => order.id === order_id)?.status
          ) {
            this.logger.info(
              `The order ${order_id} already has the status ${statusToBeUpdated}`,
            );
          } else {
            await db.orders.update({
              where: {
                id: order_id,
              },
              data: {
                status: statusToBeUpdated,
                awb: shipment.Shipment.AWB,
              },
            });
            this.logger.info(
              `The order ${order_id} is now ${statusToBeUpdated}`,
            );
          }
        });
      }
    } catch (error) {
      this.logger.error({ error });
      throw error;
    }
  }

  public async createShipmemt(
    orders: (Orders & { user: Users | null })[],
  ): Promise<z.infer<typeof DelhiveryPackageCreationResponseSchema>> {
    try {
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
          weight: order.weight,
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
          ? //@TODO change this to dev url
          "https://track.delhivery.com/api/cmu/create.json"
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
    } catch (e) {
      console.log({ error: e });
      throw new Error("Error creating shipment");
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
      const orderIds = pickupRequestData.order_ids.map((order_id) => {
        return {
          id: order_id,
        };
      })
      await db.pickups.upsert({
        where: {
          pickup_id: validated.pickup_id,
        },
        update: {
          pickup_location: pickupRequestData.pickup_location,
          Orders: {
            connect: [
              ...orderIds
            ]
          },
          pickup_date: format(
            new Date(validated.pickup_date),
            "yyyy-MM-dd",
          ).toString(),
        },
        create: {
          pickup_id: validated.pickup_id,
          Orders: {
            connect: [
              ...orderIds
            ]
          },
          pickup_location: pickupRequestData.pickup_location,
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
