import { Inject, Service } from "typedi";
import { Logger } from "winston";
import { Resend } from "resend";
import env from "../config";
import { AppConfig } from "../config/app-config";

@Service()
export default class EmailService {
    constructor(@Inject("logger") private logger: Logger) { }

    public async sendEmail({ email, subject, html }: { email: string, subject: string, html: string }) {
        const resendInstance = new Resend(env.RESEND_API_KEY);
        this.logger.info(`Sending email to ${email}`);
        // send email using resend
        const data = await resendInstance.sendEmail({
            from: `${AppConfig.StoreName} <no-reply@${env.RESEND_DOMAIN}>`,
            to: [email],
            subject,
            html
        });
    }
}