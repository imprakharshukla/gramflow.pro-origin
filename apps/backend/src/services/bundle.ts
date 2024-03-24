import { db } from "@gramflow/db";
import Container, { Inject, Service } from "typedi";
import { Logger } from "winston";
import { z } from "zod";
import { BundlesModel } from "@gramflow/db/prisma/zod";
import { R2Service } from "./kv";
import OrderService from "./order";
import { AppConfig } from "../config/app-config";

const BundleInputZodSchema = BundlesModel.omit({ id: true, created_at: true, updated_at: true }).partial({
    images: true,
    status: true
});

type BundlesModelType = z.infer<typeof BundlesModel>;


@Service()
export class BundleService {
    constructor(@Inject("logger") private logger: Logger) { }
    createBundle = async ({ bundle }: { bundle: z.infer<typeof BundleInputZodSchema> }) => {
        try {
            return await db.bundles.create({
                data: bundle
            });
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }

    acceptBundle = async ({ id, price }: { id: string, price: string }) => {
        try {

            const orderServiceInstance = Container.get(OrderService);
            const randomString = Math.random().toString(36).substring(2, 6);
            const fakeOrderUrl = `https://www.instagram.com/p/bundles${randomString}/?img_index=0&price=${price}`;

            await orderServiceInstance.createOrder({
                instagram_post_urls: [fakeOrderUrl],
                images: [`${AppConfig.BaseStoreUrl}/bundle_og.png`],
                prebook: false,
                bundle_id: id,
                size: {
                    length: "10",
                    breadth: "10",
                    height: "10",
                    weight: "500",
                },
            });
            return db.bundles.update({
                where: {
                    id: id,
                },
                data: {
                    status: "ACCEPTED"
                }
            });
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    areBundleEnabled = async () => {
        const r2ServiceInstance = Container.get(R2Service);
        return r2ServiceInstance.getValueFromKV<Boolean>({
            key: "bundles_enabled",
            defaultValue: false
        });
    }
    deleteBundles = async (bundle_ids: string[]) => {
        try {
            return db.bundles.deleteMany({
                where: {
                    id: {
                        in: bundle_ids
                    }
                }
            });
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getBundlesCount(from?: number, to?: number, searchTerm?: string) {

        if (from === undefined || to === undefined) {
            return db.orders.count();
        }
        return db.orders.count({
            where: {
                created_at: {
                    gte: new Date(from).toISOString(),
                    lte: new Date(to).toISOString(),
                },
            },
        });
    }
    public async getBundles(
        from?: number,
        to?: number,
        page?: number,
        pageSize?: number,

    ): Promise<BundlesModelType[]> {

        if (from === undefined || to === undefined) {
            this.logger.debug("from and to are not present");
            // from and to are not present, so we are returning all the orders
            return db.bundles.findMany({
                include: {
                    user: true,
                },
                orderBy: {
                    created_at: "desc",
                },
            });
        }

        if (page === undefined || pageSize === undefined) {
            this.logger.debug("page and pageSize are not present");
            // page and pageSize are not present, so we are returning all the orders in the given date range
            return db.bundles.findMany({
                include: {
                    user: true,
                },
                where: {
                    created_at: {
                        gte: new Date(from).toISOString(),
                        lte: new Date(to).toISOString(),
                    },
                },
                orderBy: {
                    created_at: "desc",
                },
            });
        }

        // All the required parameters are present, so we are returning orders within the date range with pagination
        const offset = page * pageSize;
        return db.bundles.findMany({
            include: {
                user: true,
            },
            where: {
                created_at: {
                    gte: new Date(from).toISOString(),
                    lte: new Date(to).toISOString(),
                },
            },
            orderBy: {
                created_at: "desc",
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
    }
}
