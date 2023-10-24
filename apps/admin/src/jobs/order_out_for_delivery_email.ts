import { Status } from "@prisma/client";
import { Slack } from "@trigger.dev/slack";
import { SupabaseManagement } from "@trigger.dev/supabase";
import { Resend } from "resend";

import { OrderAcceptedEmail, OrderOutForDeliveryEmail } from "@acme/email";
import { AppConfig } from "@acme/utils";

import { env } from "~/env.mjs";
import { client } from "~/trigger";
import { type Database } from "../../types/supabase";
import { prisma } from "../lib/prismaClient";

const resend = new Resend(env.RESEND_API_KEY);
const slack = new Slack({
  id: "slack",
});

// Use OAuth to authenticate with Supabase Management API
const supabaseManagement = new SupabaseManagement({
  id: env.TRIGGER_SUPABASE_ID,
});

const supabaseTriggers = supabaseManagement.db<Database>(env.SUPABASE_URL);

client.defineJob({
    id: "order-out-for-delivery-email",
    name: "Order Out For Delivery Email",
  version: "1.0.0",
  trigger: supabaseTriggers.onUpdated({
    schema: "public",
    table: "Orders",
    filter: {
      old_record: {
        status: [{ $ignoreCaseEquals: Status.SHIPPED }],
      },
      record: {
        status: [{ $ignoreCaseEquals: Status.OUT_FOR_DELIVERY }],
      },
    },
  }),
  integrations: {
    slack,
  },
  run: async (payload, io, ctx) => {
    if (!payload.record.user_id) {
      await io.logger.error("User ID not available!");
      return;
    }
    const user = await prisma.users.findUnique({
      where: {
        id: payload.record.user_id,
      },
    });

    if (!user) {
      await io.logger.error("User not found!");
      return;
    }
    if (user.email.includes(AppConfig.Domain)) {
      await io.logger.info("Order email sent!");
      return;
    }

    const data = await resend.emails.send({
      from: `${AppConfig.StoreName.replace(" ", "")} <no-reply@${
        env.RESEND_DOMAIN
      }>`,
      to: [user.email],
      subject: "Order Out For Delivery",
      //@ts-ignore
      react: OrderOutForDeliveryEmail({ order: payload.record }),
    });
    console.log({ data });
    console.log(`Email sent to ${user.email}`);

    await io.slack.postMessage("post message", {
      channel: "C05PJ1T8CE7",
      text: `Sent email to ${user.email} for out for delivery of order ${payload.record.id}! ✅`,
    });
    await io.logger.info(`Email sent to ${user.email}`);
    return { status: "success" };
  },
});