import { TsRestRequest, initServer } from "@ts-rest/express";
import Container from "typedi";
import { Logger } from "winston";

import { postContract } from "@gramflow/contract";

import PostsService from "../../services/post";
import { adminOnlyMiddleware } from "../middleware/auth";

export default (server: ReturnType<typeof initServer>) => {
  return server.router(postContract, {
    getAllPosts: {
      middleware:
        [
          adminOnlyMiddleware<TsRestRequest<typeof postContract.getAllPosts>>
        ],
      handler: async ({ query }) => {
        const logger: Logger = Container.get("logger");
        logger.debug("Calling Get-All-Posts endpoint with query: %o", query);
        const postServiceInstance = Container.get(PostsService);
        const posts = await postServiceInstance.getAllPosts(query);
        return {
          status: 200,
          body: posts,
        };
      },
    },
  });
};
