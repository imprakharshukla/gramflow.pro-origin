import fs from "fs";
import os from "os";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { cronTrigger, isTriggerError } from "@trigger.dev/sdk";

import { env } from "~/env.mjs";
import { client } from "~/trigger";
import { prisma } from "../lib/prismaClient";

const fsPromises = fs.promises;

client.defineJob({
  id: "database-backup",
  name: "Database Backup",
  enabled: true,
  version: "0.0.1",
  trigger: cronTrigger({
    cron: "0 */3 * * *",
  }),
  run: async (_, io, ctx) => {
    const { users, orders, posts } = await io.runTask(
      `Fetching data from database`,
      async () => {
        const users = await prisma.users.findMany();
        const orders = await prisma.orders.findMany();
        const posts = await prisma.posts.findMany();
        return { users, orders, posts };
      },
    );

    const data = {
      users,
      orders,
      posts,
    };

    try {
      const fileName = await io.runTask(`Writing file for backup`, async () => {
        const fileName = `${os.tmpdir()}/backup_${new Date().getTime()}.json`;
        await fsPromises.writeFile(fileName, JSON.stringify(data, null, 2));
        return fileName;
      });

      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CF_ACCESS_KEY_ID ?? "",
          secretAccessKey: env.CF_SECRET_ACCESS_KEY ?? "",
        },
      });

      const uploadParams = {
        Bucket: env.CF_BUCKET_NAME,
        Key: fileName,
        Body: fs.createReadStream(fileName),
      };

      const fileInfo = await fsPromises.stat(fileName);
      io.logger.info(`File Info: ${JSON.stringify(fileInfo)}`);

      const uploadCommand = new PutObjectCommand(uploadParams);

      await io.runTask(`Uploading file to S3`, async () => {
        try {
          const uploadResponse = await S3.send(uploadCommand);
          io.logger.info(`Successfully uploaded file to S3: ${uploadResponse}`);
        } catch (uploadErr) {
          io.logger.error(`Error uploading file to S3 ${uploadErr}`);
          throw uploadErr;
        }
      });
      io.logger.info("Successfully wrote file");

      await io.runTask(`Deleting file`, async () => {
        try {
          await fsPromises.unlink(fileName);
          io.logger.info("Successfully deleted file");
        } catch (deleteErr) {
          io.logger.error(`Error deleting file ${deleteErr}`);
          throw deleteErr;
        }
      });
      await io.logger.info("Successfully deleted file");
    } catch (error) {
      if (isTriggerError(error)) throw error;
      return { error: `Error writing file ${error}` };
    }
  },
});
