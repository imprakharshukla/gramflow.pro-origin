import { initQueryClient } from "@ts-rest/react-query";

import { docContract, orderContract, shipContract } from "@gramflow/contract";

import useAuthToken from "./use-auth-token";

const useDocQueryClient = (baseHeaders?: Record<string, string>) => {
  const { token } = useAuthToken();
  const client = initQueryClient(docContract, {
    baseUrl: "http://localhost:3002/api",
    baseHeaders: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  return client;
};

export default useDocQueryClient;
