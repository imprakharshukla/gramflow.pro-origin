import { bundleContract } from "@gramflow/contract";
import { TsRestRequest, initServer } from "@ts-rest/express";
import Container from "typedi";
import { Logger } from "winston";
import { BundleService } from "../../services/bundle";
import { UserService } from "../../services/user";
import { USER_ROLE } from "@gramflow/db";
import { adminOnlyMiddleware, userMiddleware } from "../middleware/auth";

export default (server: ReturnType<typeof initServer>) => {
    const logger: Logger = Container.get("logger");

    return server.router(bundleContract, {
        createBundle: {
            middleware:
                [
                    userMiddleware<TsRestRequest<typeof bundleContract.createBundle>>
                ],
            handler: async ({ body }) => {
                try {
                    logger.debug("Calling Create-Bundle endpoint with body: %o", body);
                    const userServiceInstance = Container.get(UserService)
                    let user = await userServiceInstance.getUser(body.bundle.email);
                    if (!user) {
                        user = await userServiceInstance.createUser({
                            state: "",
                            name: body.bundle.name,
                            role: USER_ROLE.USER,
                            instagram_username: body.bundle.instagramUsername,
                            house_number: "",
                            locality: "",
                            pincode: "",
                            landmark: "",
                            city: "",
                            country: "",
                            phone_no: body.bundle.phoneNumber,
                            email: body.bundle.email,
                        });
                    }
                    const bundleServiceInstance = Container.get(BundleService);
                    const bundle = await bundleServiceInstance.createBundle({
                        bundle: {
                            user_id: user.id,
                            bundle_size: body.bundle.bundleSize,
                            bundle_description: body.bundle.bundleDescription,
                            aesthetics: body.bundle.aesthetics,
                            other_aesthetics: body.bundle.otherAesthetic,
                            images: body.bundle.pictures,
                            fashion_dislikes: body.bundle.fashionDislikes,
                            link_input: body.bundle.linkInput,
                            top_size: body.bundle.topSize,
                            waist: body.bundle.bottomSize.waist,
                            length: body.bundle.bottomSize.length,
                        }
                    });
                    return {
                        status: 200,
                        body: bundle
                    };
                }
                catch (e: any) {
                    logger.error(e);
                    return {
                        status: 400,
                        body: e.message ? e.message : "Something went wrong!  ",
                    };
                }
            },
        },
        acceptBundle: {
            middleware:
                [
                    adminOnlyMiddleware<TsRestRequest<typeof bundleContract.acceptBundle>>
                ],
            handler: async ({ body }) => {
                try {
                    logger.debug("Calling Accept-Bundle endpoint with body: %o", body);
                    const bundleServiceInstance = Container.get(BundleService);
                    await bundleServiceInstance.acceptBundle({
                        id: body.id,
                        price: body.price
                    });
                    return {
                        status: 200,
                        body: "OK"
                    };
                } catch (e: any) {
                    logger.error(e);
                    return {
                        status: 400,
                        body: e.message ? e.message : "Something went wrong!  ",
                    };
                }
            }
        },
        deleteBundles: {
            middleware:
                [
                    adminOnlyMiddleware<TsRestRequest<typeof bundleContract.deleteBundles>>
                ],
            handler: async ({ query }) => {
                try {
                    logger.debug("Calling Delete-Bundle endpoint with body: %o", query);
                    const bundleServiceInstance = Container.get(BundleService);
                    await bundleServiceInstance.deleteBundles(query.bundle_ids.split(","));
                    return {
                        status: 200,
                        body: "OK"
                    };
                } catch (e: any) {
                    logger.error(e);
                    return {
                        status: 400,
                        body: e.message ? e.message : "Something went wrong!  ",
                    };
                }
            }
        },
        getBundles: {
            middleware:
                [
                    adminOnlyMiddleware<TsRestRequest<typeof bundleContract.getBundles>>
                ],
            handler: async ({ query }) => {
                try {
                    logger.debug("Calling Get-Bundle endpoint with query: %o", query);
                    const bundleServiceInstance = Container.get(BundleService);
                    const bundles = await bundleServiceInstance.getBundles(
                        Number(query.from),
                        Number(query.to),
                        Number(query.page),
                        Number(query.pageSize),
                    );
                    const count = await bundleServiceInstance.getBundlesCount(
                        Number(query.from),
                        Number(query.to),
                    );
                    return {
                        status: 200,
                        body: { bundles, count }
                    };
                } catch (e: any) {
                    logger.error(e);
                    return {
                        status: 400,
                        body: e.message ? e.message : "Something went wrong!  ",
                    };
                }
            }
        }
    });
}