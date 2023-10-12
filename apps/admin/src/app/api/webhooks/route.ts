import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

const bodySchema = z.object({
  data: z.object({
    birthday: z.string(),
    created_at: z.number(),
    email_addresses: z.array(
      z.object({
        email_address: z.string(),
        id: z.string(),
        linked_to: z.array(z.unknown()),
        object: z.string(),
        verification: z.object({ status: z.string(), strategy: z.string() }),
      }),
    ),
    external_accounts: z.array(z.unknown()),
    external_id: z.string(),
    first_name: z.string(),
    gender: z.string(),
    id: z.string(),
    image_url: z.string(),
    last_name: z.string(),
    last_sign_in_at: z.number(),
    object: z.string(),
    password_enabled: z.boolean(),
    phone_numbers: z.array(z.unknown()),
    primary_email_address_id: z.string(),
    primary_phone_number_id: z.null(),
    primary_web3_wallet_id: z.null(),
    private_metadata: z.object({}),
    profile_image_url: z.string(),
    public_metadata: z.object({}),
    two_factor_enabled: z.boolean(),
    unsafe_metadata: z.object({}),
    updated_at: z.number(),
    username: z.null(),
    web3_wallets: z.array(z.unknown()),
  }),
  object: z.string(),
  type: z.string(),
});

export async function POST(req: Request) {
  const { data } = await req.json();
  const validated = bodySchema.parse(data);
  console.log({ validated });

  const newUserId = validated.data.id;
  await clerkClient.users.deleteUser(newUserId);
  console.log("Deleted the user: ", { newUserId });
  return new Response("OK");
}
