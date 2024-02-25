import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { initServer } from "@ts-rest/express";
import Container, { Inject } from "typedi";
import { Logger } from "winston";
import { z } from "zod";

import { docContract } from "@gramflow/contract";

import { AppConfig } from "../../config/app-config";
import DocumentService from "../../services/document";
import OrderService from "../../services/order";
import { CSVSchema, OrderSchemaCSV } from "../schema/document";

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

export default (server: ReturnType<typeof initServer>) => {
  const logger: Logger = Container.get("logger");
  return server.router(docContract, {
    generateLabelPDF: async ({ query }) => {
      logger.info("Calling Generate-Label-PDF endpoint with query: %o", query);
      const documentServiceInstance = Container.get(DocumentService);
      //@TODO change this url to the actual url
      const labelFilePath = await documentServiceInstance.generatePDFFile(
        `http://localhost:3000/shi`,
      );
      const contentType = "application/pdf";
      const labelFileReadStream = fs.createReadStream(labelFilePath);
      const fileName = `shipping_label_${new Date()
        .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        .replace(/\/|,|:| /g, "-")}.pdf`;
      const contentDisposition = `attachment; filename="${fileName}"`;
      logger.info(
        `Generated label file: ${labelFilePath} with name: ${fileName}`,
      );
      return {
        status: 200,
        body: labelFileReadStream,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
        },
      };
    },
    generateShipmentCSVFile: async ({ query }) => {
      logger.info(
        "Calling Generate-Shipment-CSV-File endpoint with query: %o",
        query,
      );
      const getPostIdAndImageIndex = (
        url: string,
      ): {
        postId: string;
        imageIndex: string;
      } => {
        const regex = /\/p\/([A-Za-z0-9-_]+)\/\?img_index=(\d+)/;
        const match = url.match(regex);
        if (match) {
          const postID = match[1];
          const imageIndex = match[2];
          return {
            postId: postID ?? "P",
            imageIndex: imageIndex ?? "(0)",
          };
        } else {
          return {
            postId: "",
            imageIndex: "",
          };
        }
      };

      const documentServiceInstance = Container.get(DocumentService);
      const orderServiceInstance = Container.get(OrderService);
      const orderIds = query.order_ids.split(",");
      const orders = await orderServiceInstance.getOrdersById(orderIds);

      const csvArray: z.infer<typeof CSVSchema> = [];
      orders.forEach((order) => {
        const products: string[] = [];
        let totalPrice = 0;
        order.instagram_post_urls.map((url) => {
          const { postId, imageIndex } = getPostIdAndImageIndex(url);
          products.push(`${postId}(${imageIndex})`);
          const uri = new URL(url);
          const priceValue = uri.searchParams.get("price");
          const parsedPrice = Number(priceValue);
          totalPrice += parsedPrice;
        });

        const csvFormattedOrder: z.infer<typeof OrderSchemaCSV> = {
          "Sale Order Number": order.id,
          "Pickup Location Name": AppConfig.WarehouseDetails.name,
          "Transport Mode": "Surface",
          "Payment Mode": "Prepaid",
          "COD Amount": "",
          "Customer Name": order.user?.name ?? "",
          "Customer Phone": order.user?.phone_no ?? "",
          "Shipping Address Line1": `${order.user?.house_number}, ${order.user?.locality}`,
          "Shipping Address Line2": "",
          "Shipping City": order.user?.city ?? "",
          "Shipping State": order.user?.state ?? "",
          "Shipping Pincode": order.user?.pincode ?? "",
          "Item Sku Code": products.join(" & "),
          "Item Sku Name": products.join(" & "),
          "Quantity Ordered": "1",
          "Unit Item Price": totalPrice.toString() ?? "100",
          "Length (cm)": order.length ?? "20",
          "Breadth (cm)": order.breadth ?? "20",
          "Height (cm)": order.height ?? "10",
          "Weight (gm)": order.weight ?? "500",
          "Fragile Shipment": "No",
          "Discount Type": "",
          "Discount Value": "",
          "Tax Class Code": "",
          "Customer Email": order.user?.email,
          "Billing Address same as Shipping Address": "Yes",
          "Billing Address Line1": "",
          "Billing Address Line2": "",
          "Billing City": "",
          "Billing State": "",
          "Billing Pincode": "",
          "e-Way Bill Number": "",
          "Seller Name": "",
          "Seller GST Number": "",
          "Seller Address Line1": "",
          "Seller Address Line2": "",
        };
        csvArray.push(csvFormattedOrder);
      });

      const fileName = `${new Date().valueOf()}.csv`;
      const tempFilePath = path.join(os.tmpdir(), fileName);
      const csvWriter = createCsvWriter({
        path: tempFilePath,
        header: [
          { id: "Sale Order Number", title: "*Sale Order Number" },
          { id: "Pickup Location Name", title: "*Pickup Location Name" },
          { id: "Transport Mode", title: "*Transport Mode" },
          { id: "Payment Mode", title: "*Payment Mode" },
          { id: "COD Amount", title: "COD Amount" },
          { id: "Customer Name", title: "*Customer Name" },
          { id: "Customer Phone", title: "*Customer Phone" },
          { id: "Shipping Address Line1", title: "*Shipping Address Line1" },
          { id: "Shipping Address Line2", title: "Shipping Address Line2" },
          { id: "Shipping City", title: "*Shipping City" },
          { id: "Shipping State", title: "*Shipping State" },
          { id: "Shipping Pincode", title: "*Shipping Pincode" },
          { id: "Item Sku Code", title: "*Item Sku Code" },
          { id: "Item Sku Name", title: "*Item Sku Name" },
          { id: "Quantity Ordered", title: "*Quantity Ordered" },
          { id: "Unit Item Price", title: "*Unit Item Price" },
          { id: "Length (cm)", title: "Length (cm)" },
          { id: "Breadth (cm)", title: "Breadth (cm)" },
          { id: "Height (cm)", title: "Height (cm)" },
          { id: "Weight (gm)", title: "Weight (gm)" },
          { id: "Fragile Shipment", title: "Fragile Shipment" },
          { id: "Discount Type", title: "Discount Type" },
          { id: "Discount Value", title: "Discount Value" },
          { id: "Tax Class Code", title: "Tax Class Code" },
          { id: "Customer Email", title: "Customer Email" },
          {
            id: "Billing Address same as Shipping Address",
            title: "Billing Address same as Shipping Address",
          },
          { id: "Billing Address Line1", title: "Billing Address Line1" },
          { id: "Billing Address Line2", title: "Billing Address Line2" },
          { id: "Billing City", title: "Billing City" },
          { id: "Billing State", title: "Billing State" },
          { id: "Billing Pincode", title: "Billing Pincode" },
          { id: "e-Way Bill Number", title: "e-Way Bill Number" },
          { id: "Seller Name", title: "Seller Name" },
          { id: "Seller GST Number", title: "Seller GST Number" },
          { id: "Seller Address Line1", title: "Seller Address Line1" },
          { id: "Seller Address Line2", title: "Seller Address Line2" },
          { id: "Seller City", title: "Seller City" },
          { id: "Seller State", title: "Seller State" },
          { id: "Seller Pincode", title: "Seller Pincode" },
        ],
      });

      await csvWriter.writeRecords(csvArray);
      logger.info(`CSV file written to ${tempFilePath}`);
      const contentType = "text/csv";
      const csvFileReadStream = fs.createReadStream(tempFilePath);
      const contentDisposition = `attachment; filename="${fileName}"`;
      logger.info(`Generated CSV file: ${tempFilePath} with name: ${fileName}`);
      return {
        status: 200,
        body: csvFileReadStream,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
        },
      };
    },
  });
};
