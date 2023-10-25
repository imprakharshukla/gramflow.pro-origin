import { type z } from "zod";

import { type OrdersModel, type UsersModel } from "@gramflow/db/prisma/zod";

export const orderSeedData: z.infer<typeof OrdersModel> = {
  //random uuid
  id: "ad3b8b9c-4f3a-4b7a-8b1a-3b8b9c4f3a4b",
  instagram_post_urls: ["https://www.instagram.com/p/COZ1QqYhZ0Q/"],
  //random uuid
  user_id: "52587e14-7131-4560-93c0-6720323f9891",
  status: "PENDING",
  courier: "DELHIVERY",
  images: ["https://www.instagram.com/p/COZ1QqYhZ0Q/"],
  awb: "42352351435",
  created_at: new Date(),
  updated_at: new Date(),
};

export const userSeedData: z.infer<typeof UsersModel> = {
  id: "52587e14-7131-4560-93c0-6720323f9891",
  email: "john@email.com",
  name: "John Doe",
  phone_no: "1234567890",
  house_number: "123 Main St",
  city: "New York",
  state: "NY",
  locality: "Manhattan",
  country: "USA",
  instagram_username: "john_doe",
  pincode: "100201",
  created_at: new Date(),
  updated_at: new Date(),
};
