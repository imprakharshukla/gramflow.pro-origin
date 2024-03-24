import { superContract } from "@gramflow/contract";
import { InitClientReturn, initQueryClient } from "@ts-rest/react-query";
import { InitClientArgs } from "@ts-rest/next";
import axios, { Method, isAxiosError } from "axios";
export interface TokenProvider {
    getToken: () => Promise<string>;
}

export class RestAPI {
    tokenProvider: TokenProvider;
    public client: InitClientReturn<typeof superContract, InitClientArgs>;

    constructor(tokenProvider: TokenProvider) {
        const baseUrl = "http://localhost:3002/api"

        this.tokenProvider = tokenProvider;
        this.client = initQueryClient<typeof superContract, InitClientArgs>(superContract, {
            baseUrl: baseUrl,
            baseHeaders: {},
            api: async ({ path, method, headers, body }) => {
                const token = await this.tokenProvider.getToken();
                try {
                    const result = await axios.request({
                        method: method as Method,
                        url: `${path}`,
                        headers: {
                            ...headers,
                            Authorization: `Bearer ${token}`,
                        },
                        data: body,
                    });

                    const responseHeaders = new Headers();
                    Object.entries(result.headers).forEach(([key, value]) => {
                        if (value !== undefined && typeof value === 'string') {
                            responseHeaders.append(key, value.toString());
                        }
                    });

                    return {
                        status: result.status,
                        body: result.data,
                        headers: responseHeaders,
                    };
                } catch (e) {
                    if (isAxiosError(e) && e.response) {
                        const errorHeaders = new Headers();
                        Object.entries(e.response.headers).forEach(([key, value]) => {
                            if (value !== undefined && typeof value === 'string') {
                                errorHeaders.append(key, value.toString());
                            }
                        });
                        return {
                            status: e.response.status,
                            body: e.response.data,
                            headers: errorHeaders,
                        };
                    }
                    throw e;
                }
            },
        });
    }
}