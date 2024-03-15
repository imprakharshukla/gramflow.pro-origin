import { initQueryClient } from "@ts-rest/react-query";

import { orderContract, shipContract } from "@gramflow/contract";


const useOrderQueryClient = (baseHeaders?: Record<string, string>) => {
  const client = initQueryClient(orderContract, {
    baseUrl: "http://localhost:3002/api",
    baseHeaders: {
      ...baseHeaders,
    },
  });

  return client;
};

export default useOrderQueryClient;
