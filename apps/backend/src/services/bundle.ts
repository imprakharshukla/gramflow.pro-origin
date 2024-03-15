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
}
