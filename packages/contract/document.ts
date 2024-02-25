import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const docContract = c.router({
  generateLabelPDF: {
    method: "GET",
    path: "/document/label",
    headers: z.object({
      "Content-Type": z.string().optional(),
      "Content-disposition": z.string().optional(),
    }),
    responses: {
      200: z.unknown(),
    },
    query: z.object({
      order_ids: z.string(),
    }),
    summary: "Generate a shipping label PDF",
  },
  generateShipmentCSVFile: {
    method: "GET",
    path: "/document/shipment",
    headers: z.object({
      "Content-Type": z.string().optional(),
      "Content-disposition": z.string().optional(),
    }),
    responses: {
      200: z.unknown(),
    },
    query: z.object({
      order_ids: z.string(),
    }),
    summary: "Generate a shipment CSV file",
  },
});
