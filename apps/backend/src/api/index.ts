import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { Router } from "express";

import {
  analyticsContract,
  bundleContract,
  orderContract,
  postContract,
  shipContract,
} from "@gramflow/contract";
var { expressjwt: jwt } = require("express-jwt");

import analytics from "./routes/analytics";
import document from "./routes/document";
import order from "./routes/order";
import post from "./routes/post";
import ship from "./routes/ship";
import bundle from "./routes/bundle";
import auth from "./routes/auth";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  const s = initServer();
  const orderRouter = order(s);
  const shipRouter = ship(s);
  const postRouter = post(s);
  const analyticsRouter = analytics(s);
  const bundleRouter = bundle(s);
  const authRouter = auth(s)
  createExpressEndpoints(orderContract, orderRouter, app)
  createExpressEndpoints(shipContract, shipRouter, app);
  document(app);
  createExpressEndpoints(postContract, postRouter, app);
  createExpressEndpoints(analyticsContract, analyticsRouter, app);
  createExpressEndpoints(bundleContract, bundleRouter, app);
  return app;
};
