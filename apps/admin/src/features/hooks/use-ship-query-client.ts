import { initQueryClient } from "@ts-rest/react-query";

import { shipContract } from "@gramflow/contract";


const useShippingQueryClient = (baseHeaders?: Record<string, string>) => {
  const client = initQueryClient(shipContract, {
    baseUrl: "http://localhost:3002/api",
    baseHeaders: {
      ...baseHeaders,
    },
  });

  return client;
};

export default useShippingQueryClient;
