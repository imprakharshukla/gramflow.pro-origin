import { promises as fs } from "fs";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

import { env } from "../config";

@Service()
export class R2Service {
  constructor(@Inject("logger") private logger: Logger) {}

  uploadFileToR2 = async ({
    filePath,
    bucketName,
    bucketFilePath,
    provideSignedUrl = false,
    bucketDomain,
  }: {
    filePath: string;
    bucketName: string;
    bucketFilePath: string;
    provideSignedUrl?: boolean;
    bucketDomain: string;
  }) => {
    try {
      // Read file and convert it to a buffer
      const fileContent = await fs.readFile(filePath);
      const fileBuffer = Buffer.from(fileContent);

      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CF_ACCESS_KEY_ID ?? "",
          secretAccessKey: env.CF_SECRET_ACCESS_KEY ?? "",
        },
      });
      const fileObject = {
        Bucket: bucketName,
        Key: bucketFilePath,
        Body: fileBuffer,
      };
      const putObjectCommand = new PutObjectCommand(fileObject);
      await S3.send(putObjectCommand);

      if (provideSignedUrl) {
        return await getSignedUrl(
          S3,
          new GetObjectCommand({
            Bucket: fileObject.Bucket,
            Key: fileObject.Key,
          }),
          { expiresIn: 3600 },
        );
      } else {
        return `https://${bucketDomain}/${bucketFilePath}`;
      }
    } catch (e) {
      console.log(e);
    }
  };

  uploadFileToR2FromUrl = async ({
    fileUrl,
    bucketName,
    bucketFilePath,
    provideSignedUrl = false,
    bucketDomain,
  }: {
    fileUrl: string;
    bucketName: string;
    bucketFilePath: string;
    provideSignedUrl?: boolean;
    bucketDomain: string;
  }) => {
    try {
      // Make a GET request to the fileUrl and convert the response to a buffer
      const fileContent = await (await fetch(fileUrl)).arrayBuffer();
      const fileBuffer = Buffer.from(fileContent);

      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CF_ACCESS_KEY_ID ?? "",
          secretAccessKey: env.CF_SECRET_ACCESS_KEY ?? "",
        },
      });
      const fileObject = {
        Bucket: bucketName,
        Key: bucketFilePath,
        Body: fileBuffer,
      };
      const putObjectCommand = new PutObjectCommand(fileObject);
      await S3.send(putObjectCommand);

      if (provideSignedUrl) {
        return await getSignedUrl(
          S3,
          new GetObjectCommand({
            Bucket: fileObject.Bucket,
            Key: fileObject.Key,
          }),
          { expiresIn: 3600 },
        );
      } else {
        return `https://${bucketDomain}/${bucketFilePath}`;
      }
    } catch (e) {
      console.log(e);
    }
  };
}
