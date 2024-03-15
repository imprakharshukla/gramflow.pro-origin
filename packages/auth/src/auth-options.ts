import { DefaultSession, DefaultUser, type NextAuthOptions } from "next-auth";
import { db } from "@gramflow/db";
import { env } from "../env.mjs";
import { Resend } from 'resend';
import OtpGenerator from "otp-generator"
import { PrismaAdapter } from "next-auth-prisma-adapter";
import { USER_ROLE } from "@gramflow/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        //@ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db, {
    userModel: "Users",
    accountModel: "Account",
    sessionModel: "Session",
    verificationTokenModel: "VerificationToken",
  }),
  pages: {
    signIn: "/login",
  },
  providers: [
    {
      id: 'email',
      type: 'email',
      from: env.EMAIL_FROM,
      server: {},
      maxAge: 5 * 60,
      name: 'Email',

      options: {

      },
      async generateVerificationToken() {
        const token = OtpGenerator.generate(6, {
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          digits: true,
          specialChars: false,
        })
        console.log("Generated OTP", token)
        return token;
      },

      async sendVerificationRequest({ identifier: email, url, token }) {
        console.log("Token", token)
        try {
          console.log("Sending email....", email)
          // const data = await resend.emails.send({
          //   from: `${AppConfig.StoreName} <${env.EMAIL_FROM}>`,
          //   to: [email],
          //   subject: "Login to your account",
          //   html: OtpEmailHtml({
          //     emailDetails: {
          //       otp: token,
          //       storeName: AppConfig.StoreName,
          //       storeInstagramUsername: AppConfig.InstagramUsername,
          //       baseOrderUrl: AppConfig.BaseOrderUrl,
          //       warehouseCity: AppConfig.WarehouseDetails.city,
          //       warehouseState: AppConfig.WarehouseDetails.state,
          //       warehouseCountry: AppConfig.WarehouseDetails.country,
          //     }
          //   })
          // });

          //console.log(data)
        } catch (e) {
          console.log(e)
          throw new Error(JSON.stringify(e))
        }
      },
    }
  ],
};
