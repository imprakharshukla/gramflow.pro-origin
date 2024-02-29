import { initQueryClient } from "@ts-rest/react-query";

import { orderContract, shipContract } from "@gramflow/contract";

import useAuthToken from "./use-auth-token";

const useOrderQueryClient = (baseHeaders?: Record<string, string>) => {
  const { token } = useAuthToken();
  const client = initQueryClient(orderContract, {
    baseUrl: "http://localhost:3002/api",
    baseHeaders: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  return client;
};

export default useOrderQueryClient;
