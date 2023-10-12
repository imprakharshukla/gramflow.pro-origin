import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@acme/db";

const allowedEmails = [
  "imprakharshukla@gmail.com",
  "prakharshukla117@gmail.com",
  "shristir35@gmail.com",
];
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log({ user });
      if (!user.email) return false;
      return allowedEmails.includes(user.email);
    },
  },
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/sign-in",
    error: "/sign-in-error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
  ],
};
