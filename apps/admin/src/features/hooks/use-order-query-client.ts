import { initQueryClient } from "@ts-rest/react-query";

import { orderContract } from "@gramflow/contract";

const useOrderQueryClient = (baseHeaders?: Record<string, string>) => {
  
  const client = initQueryClient(orderContract, {
    baseUrl: "http://localhost:3002/api",
    baseHeaders: {
      ...baseHeaders,
      // Authorization: `Bearer ${token}`,
    },
  });

  return client;
};

export default useOrderQueryClient;
