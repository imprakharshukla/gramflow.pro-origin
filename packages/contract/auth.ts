import { initContract } from "@ts-rest/core";
import { z } from "zod";
const c = initContract();
export const authContract = c.router({
    generateOtp: {
        method: "GET",
        path: "/otp/generate",
        responses: {
            200: z.string(),
            400: z.string()
        },
        query: z.object({
            email: z.string()
        }),
        summary: "Generate OTP"
    },
    verifyOtp: {
        method: "POST",
        path: "/otp/verify",
        responses: {
            200: z.object({
                token: z.string()
            }),
            400: z.string()
        },
        body: z.object({
            email: z.string(),
            otp: z.string()
        }),
        summary: "Verify OTP"
    },

})