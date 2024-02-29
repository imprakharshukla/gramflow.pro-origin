import { initQueryClient } from "@ts-rest/react-query";

import { shipContract } from "@gramflow/contract";

import useAuthToken from "./use-auth-token";

const useShippingQueryClient = (baseHeaders?: Record<string, string>) => {
  const { token } = useAuthToken();
  const client = initQueryClient(shipContract, {
    baseUrl: "http://localhost:3002/api",
    baseHeaders: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  return client;
};

export default useShippingQueryClient;
