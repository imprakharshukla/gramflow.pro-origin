import { Container, Service } from "typedi";
import { z } from "zod";

import { db } from "@gramflow/db";
import { PostsModel } from "@gramflow/db/prisma/zod";

type PostsModelType = z.infer<typeof PostsModel>;

@Service()
export default class PostsService {
  public async getAllPosts({
    page,
    results,
  }: {
    page: number;
    results: number;
  }): Promise<PostsModelType[]> {
    return db.posts.findMany({
      skip: (page - 1) * results,
      take: results,
      orderBy: {
        post_created_at: "desc",
      },
    });
  }
}
