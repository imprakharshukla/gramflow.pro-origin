import { initQueryClient } from "@ts-rest/react-query";

import { bundleContract } from "@gramflow/contract";


const useBundleQueryClient = (baseHeaders?: Record<string, string>) => {
    const client = initQueryClient(bundleContract, {
        baseUrl: "http://localhost:3002/api",
        baseHeaders: {
            ...baseHeaders,
        },
    });
    return client;
};

export default useBundleQueryClient;
