import { initQueryClient } from "@ts-rest/react-query";

import {
  analyticsContract,
} from "@gramflow/contract";

import useAuthToken from "./use-auth-token";

const useAnalyticsQueryClient = (baseHeaders?: Record<string, string>) => {
  const { token } = useAuthToken();
  const client = initQueryClient(analyticsContract, {
    baseUrl: "http://localhost:3002/api",
    baseHeaders: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  return client;
};

export default useAnalyticsQueryClient;