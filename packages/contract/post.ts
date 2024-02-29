import { initContract } from "@ts-rest/core";
import { z } from "zod";

import { PostsModel } from "../db/prisma/zod";

const c = initContract();

export const postContract = c.router({
  getAllPosts: {
    method: "GET",
    path: "/posts",
    query: z.object({
      page: z.number().default(1),
      results: z.number().default(10),
    }),
    responses: {
      200: PostsModel.array(),
    },
    summary: "Get all posts",
  },
});
