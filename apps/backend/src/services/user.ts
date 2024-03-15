import { Logger } from "winston";
import { env } from "../config";
import { Inject, Service } from "typedi";
import { UsersModel } from "@gramflow/db/prisma/zod"; import { z } from "zod";
import { db } from "@gramflow/db";



const UserModelOptional = UsersModel.omit({ id: true }).optional();
const UserInputModel = UsersModel.omit({ id: true, created_at: true, updated_at: true });
@Service()
export class UserService {
    constructor(@Inject("logger") private logger: Logger) { }

    getUser = async (email: string) => {
        try {
            return await db.users.findUnique({
                where: {
                    email: email
                }
            });

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    createUser = async (user: z.infer<typeof UserInputModel>) => {
        try {
            return await db.users.create({
                data: user
            });
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    upsertUser = async (user: z.infer<typeof UserInputModel>) => {
        try {
            return await db.users.upsert({
                where: {
                    email: user.email
                },
                update: user,
                create: user
            });
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    updateUser = async (email: string, user: z.infer<typeof UserInputModel>) => {
        try {
            if (!user) {
                this.logger.error("User data is required");
                throw new Error("User data is required");
            }
            return await db.users.update({
                where: {
                    email: email
                },
                data: user
            });
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
}