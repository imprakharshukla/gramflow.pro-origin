import { COURIER, Status } from "@prisma/client";
import { Slack } from "@trigger.dev/slack";
import { SupabaseManagement } from "@trigger.dev/supabase";
import { Resend } from "resend";

import { OrderAcceptedEmail } from "@gramflow/email";
import { AppConfig } from "@gramflow/utils";

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
  id: "order-placed-email",
  name: "Order Placed Email",
  version: "1.0.0",
  trigger: supabaseTriggers.onUpdated({
    schema: "public",
    table: "Orders",
    filter: {
      old_record: {
        status: [{ $ignoreCaseEquals: Status.PENDING }],
      },
      record: {
        status: [{ $ignoreCaseEquals: Status.ACCEPTED }],
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

    const order = payload.record;
    const data = await resend.emails.send({
      from: `${AppConfig.StoreName} <no-reply@${
        env.RESEND_DOMAIN
      }>`,
      to: [user.email],
      subject: "Order Placed",
      react: OrderAcceptedEmail({
        id: order.id,
        awb: order.awb ?? "",
        name: user.name,
        house_number: user.house_number,
        pincode: user.pincode,
        landmark: user.landmark ?? "",
        locality: user.locality,
        city: user.city,
        state: user.state,
        country: user.country,
      }),
    });
    console.log({ data });
    console.log(`Email sent to ${user.email}`);

    await io.slack.postMessage("post message", {
      channel: "C05PJ1T8CE7",
      text: `Sent email to ${user.email} for placed order ${payload.record.id}! ✅`,
    });
    await io.logger.info(`Email sent to ${user.email}`);
    return { status: "success" };
  },
});
