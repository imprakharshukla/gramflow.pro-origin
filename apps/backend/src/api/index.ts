import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { Router } from "express";

import {
  analyticsContract,
  docContract,
  orderContract,
  postContract,
  shipContract,
} from "@gramflow/contract";

import analytics from "./routes/analytics";
import document from "./routes/document";
import order from "./routes/order";
import post from "./routes/post";
import ship from "./routes/ship";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  const s = initServer();
  const orderRouter = order(s);
  const shipRouter = ship(s);
  const postRouter = post(s);
  const analyticsRouter = analytics(s);
  createExpressEndpoints(orderContract, orderRouter, app);
  createExpressEndpoints(shipContract, shipRouter, app);
  // createExpressEndpoints(docContract, documentRouter, app);
  document(app);
  createExpressEndpoints(postContract, postRouter, app);
  createExpressEndpoints(analyticsContract, analyticsRouter, app);
  return app;
};
