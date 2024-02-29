import { generateOpenApi } from "@ts-rest/open-api";
import { superContract } from "@gramflow/contract";

export const openApiDocument = generateOpenApi(superContract, {
  info: {
    title: "Gramflo API",
    version: "1.0.0",
  },
});
