import { Inject, Service } from "typedi";
import { Logger } from "winston";
import otpGenerator from "otp-generator"
import { db } from "@gramflow/db"
import jwt, { verify, sign } from "jsonwebtoken"
import env from "../config";
@Service()
export class AuthService {
    constructor(@Inject("logger") private logger: Logger) { }
    generateOtp = async ({ email }: { email: string }) => {
        const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, digits: true, upperCaseAlphabets: false, specialChars: false });
        await db.otp.create({
            data: {
                otp,
                expires: new Date(Date.now() + 5 * 60000),
                email
            }
        })

        this.logger.info(`Sending OTP to ${email} with OTP ${otp}`);
        return otp;
    }
    verifyOtp = async ({ email, otp }: { email: string, otp: string }) => {
        // find the otp with the particular email which has not expired
        this.logger.info(`Verifying OTP for ${email}`);
        const otpRecord = await db.otp.findFirst({
            where: {
                email,
                otp,
                expires: {
                    gt: new Date()
                }
            }
        })
        this.logger.info(`Otp in record is ${otpRecord?.otp}`);
        if (otpRecord?.otp) {
            return true;
        }
        return false;
    }
    generateJwt = async ({ email }: { email: string }) => {
        //find the user with the email and if it not does not exist, create a new user
        let user = await db.users.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            user = await db.users.create({
                data: {
                    email,
                }
            })
        }

        if (!user) {
            throw new Error("User not found")
        }
        this.logger.info(`Generating JWT for ${email}`);
        return sign({ user_id: user.id }, env.JWT_TOKEN_SECRET, { expiresIn: '3d' });
    }
    verifyJwt = async ({ jwt }: { jwt: string }) => {
        return verify(jwt, env.JWT_TOKEN_SECRET);
    }
}