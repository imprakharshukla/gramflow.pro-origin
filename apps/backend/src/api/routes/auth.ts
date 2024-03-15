import { authContract } from "@gramflow/contract/auth";
import { initServer } from "@ts-rest/express";
import Container from "typedi";
import { Logger } from "winston";
import { AuthService } from "../../services/auth";
import EmailService from "../../services/email";


export default (server: ReturnType<typeof initServer>) => {
    const logger: Logger = Container.get("logger");
    const authServiceInstance = Container.get(AuthService);
    const emailServiceInstance = Container.get(EmailService);
    return server.router(authContract, {
        generateOtp: async ({ query }) => {
            const otp = await authServiceInstance.generateOtp({
                email: query.email
            });


            // await emailServiceInstance.sendEmail({
            //     email: query.email,
            //     html: getOtpEmailHtml({
            //         emailDetails: {
            //             otp: otp,
            //             warehouseCity: AppConfig.WarehouseDetails.city,
            //             warehouseCountry: AppConfig.WarehouseDetails.country,
            //             warehouseState: AppConfig.WarehouseDetails.state,
            //             storeInstagramUsername: AppConfig.InstagramUsername,
            //             storeName: AppConfig.StoreName,
            //             baseOrderUrl: AppConfig.BaseOrderUrl
            //         }
            //     }),
            //     subject: `Your OTP for ${AppConfig.StoreName}`
            // })

            return {
                status: 200,
                body: "OTP sent successfully"
            }
        },
        verifyOtp: async ({ body }) => {
            const result = await authServiceInstance.verifyOtp({
                email: body.email,
                otp: body.otp
            });
            if (!result) {
                return {
                    status: 400,
                    body: "Invalid OTP"
                }
            }
            const jwt = await authServiceInstance.generateJwt({
                email: body.email
            })
            return {
                status: 200,
                body: {
                    token: jwt
                }
            }
        }
    })
}