import { Status } from "@prisma/client";
import { Slack } from "@trigger.dev/slack";
import { SupabaseManagement } from "@trigger.dev/supabase";
import formData from "form-data";
import Mailgun from "mailgun.js";

import { AppConfig } from "@acme/utils";

import { env } from "~/env.mjs";
import { client } from "~/trigger";
import { type Database } from "../../types/supabase";
import { prisma } from "../lib/prismaClient";

// @ts-ignore
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: env.MAILGUN_API_KEY ?? "",
});
const Domain = env.MAILGUN_DOMAIN ?? "";

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

    const data = {
      from: `${AppConfig.StoreName} Updates <no-reply@${env.MAILGUN_DOMAIN}>`,
      to: user.email,
      subject: "Order Confirmed",
      template: "purchase_confirm",
      "h:X-Mailgun-Variables": JSON.stringify({
        order_id: payload.record.id,
        name: user.name,
        tracking_link: `
      ${AppConfig.BaseOrderUrl}/order/${payload.record.id}`,
      }),
    };
    const email = await mg.messages.create(Domain, data);
    await io.slack.postMessage("post message", {
      channel: "C05PJ1T8CE7",
      text: `Sent email to ${user.email} with id ${email.id} for placed order ${payload.record.id}! ✅`,
    });
    await io.logger.info(`Email sent to ${user.email} with id ${email.id}`);
    return { status: "success" };
  },
});
