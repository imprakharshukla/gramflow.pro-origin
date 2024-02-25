import { initServer } from "@ts-rest/express";
import cors from "cors";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import * as swaggerUi from "swagger-ui-express";

import routes from "../api";
import { openApiDocument } from "../loaders/open-api";

export default ({ app }: { app: express.Application }) => {
  /**
   * Health Check endpoints
   */
  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Transforms the raw string of req.body into json
  app.use(express.json());
  // Load API routes
  const router = routes();
  app.use("/api", router);

  // Load OpenAPI document
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument),
  );

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err: any = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  /// error handlers
  app.use(((err, req, res, next) => {
    /**
     * @TODO Handle 401 thrown by clerk
     */
    if (err.name === "UnauthorizedError") {
      return res.status(err.status).send({ message: err.message }).end();
    }
    return next(err);
  }) satisfies ErrorRequestHandler);
  app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  }) satisfies ErrorRequestHandler);
};
