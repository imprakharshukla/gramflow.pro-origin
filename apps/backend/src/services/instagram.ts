import fetch, { Response } from "node-fetch";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import { z } from "zod";

import { env } from "../config";

enum MediaTypeEnum {
  CAROUSEL_ALBUM = "CAROUSEL_ALBUM",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface MediaData {
  id: string;
  permalink: string;
  media_url: string;
  caption: string;
  media_type: "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO";
  timestamp: string;
}

const CursorsSchema = z.object({
  before: z.string(),
  after: z.string(),
});

const ChildSchema = z.object({
  media_url: z.string(),
  media_type: z.string(),
});

const DaumSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  media_url: z.string(),
  caption: z.string().default(""),
  media_type: z.nativeEnum(MediaTypeEnum),
  permalink: z.string(),
});

const PagingSchema = z.object({
  cursors: CursorsSchema,
  next: z.string().optional(),
});

const RootSchema = z.object({
  data: z.array(DaumSchema),
  paging: PagingSchema.optional(),
});

const ChildRootSchema = z.object({
  data: z.array(DaumSchema),
});

@Service()
export class InstagramService {
  constructor(@Inject("logger") private logger: Logger) {}

  private extractData(data: z.infer<typeof DaumSchema>[]): MediaData[] {
    const extractedData: MediaData[] = [];
    if (data && data.length > 0) {
      extractedData.push(...data);
    }
    return extractedData;
  }

  private async fetchMediaDataWithPagination(
    mediaData: MediaData,
    index: number,
    accessToken: string,
  ): Promise<MediaData> {
    const mediaDataWithPagination: MediaData[] = [];
    let nextPage:
      | string
      | null = `https://graph.instagram.com/v17.0/${mediaData.id}/children?fields=id,media_url,permalink&access_token=${accessToken}`;
    while (nextPage) {
      const response: Response = await fetch(nextPage);
      // @ts-ignore
      const data: any = await response.json();
      // @ts-ignore
      if (data.data) {
        mediaDataWithPagination.push(...data.data);

        if (data.paging && data.paging.next) {
          nextPage = data.paging.next;
        } else {
          nextPage = null;
        }
      } else {
        nextPage = null;
      }
    }

    // @ts-ignore
    return mediaDataWithPagination[index - 1];
  }

  private async fetchMediaDataOfParent(
    permaLinkWithIndex: number[],
    permLinks: string[],
    accessToken: string,
  ): Promise<MediaData[]> {
    const mediaData: MediaData[] = [];

    let k = 0;
    for (const targetPermalink of permLinks) {
      let nextPage:
        | string
        | null = `https://graph.instagram.com/v17.0/me/media?fields=id,media_url,permalink&access_token=${accessToken}`;
      while (nextPage) {
        // @ts-ignore
        const response = await fetch(nextPage);
        // @ts-ignore
        const data = await response.json();
        // @ts-ignore
        if (data.data) {
          const temp = data.data.find(
            (item: MediaData) => item.permalink === targetPermalink,
          );
          if (temp) {
            const child = await this.fetchMediaDataWithPagination(
              temp,
              permaLinkWithIndex[k] ?? 1,
              accessToken,
            );
            mediaData.push(child);
          }

          if (data.paging && data.paging.next) {
            nextPage = data.paging.next;
          } else {
            nextPage = null;
          }
        } else {
          nextPage = null;
        }
      }
      ++k;
    }

    return mediaData;
  }

  private extractPostIdFromUrl(url: string): string | null {
    const regex = /https:\/\/www\.instagram\.com\/p\/([a-zA-Z0-9_-]+)\/.*/;
    const match = url.match(regex);
    // @ts-ignore
    return match ? match[1] : null;
  }

  private extractIndexNumberFromUrl(url: string): number {
    const regex =
      /https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+\/\?img_index=([0-9]+)/;
    const match = url.match(regex);
    // @ts-ignore
    return match ? parseInt(match[1]) : 0;
  }

  public fetchImageUrls = (urls: string[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const accessToken: string | undefined = process.env.INSTAGRAM_TOKEN;
      if (!accessToken) {
        reject("Access token not provided");
        return;
      }

      // https://www.instagram.com/p/CvhiLnsPdgV/?igshid=MTc4MmM1YmI2Ng==/?img_index=6
      // if the links contain this igshid, remove it to make it like this: https://www.instagram.com/p/CvhiLnsPdgV/?img_index=6, remove the == as well if it exists
      urls = urls.map((url) => url.replace(/\/\?igshid=[a-zA-Z0-9=]+/, ""));
      console.log("URLs:", urls);

      const permalinks = urls.map(
        (url) =>
          `https://www.instagram.com/p/${this.extractPostIdFromUrl(url)}/`,
      );
      const permalinksWithIndex = urls.map((url) =>
        this.extractIndexNumberFromUrl(url),
      );

      console.log("Permalinks:", permalinks);
      console.log("Permalinks with Index:", permalinksWithIndex);

      this.fetchMediaDataOfParent(permalinksWithIndex, permalinks, accessToken)
        .then((matchingMedia) => {
          console.log("Matching Media:", matchingMedia);
          if (matchingMedia.length > 0) {
            const mediaUrls = matchingMedia.map((item) => item.media_url);
            console.log("Media URLs:", mediaUrls);
            resolve(mediaUrls);
          } else {
            console.log("No matching media found");
            reject("No matching media found");
          }
        })
        .catch((error) => {
          console.error("Error fetching media data:", error);
          reject(error);
        });
    });
  };

  async getAllParentMediaFromInstagram({
    fields = [
      "id",
      "media_type",
      "media_url",
      "permalink",
      "caption",
      "timestamp",
    ],
    accessToken,
    postPermalink,
    limit = 100,
  }: {
    fields?: string[];
    accessToken: string;
    postNumber?: number;
    postPermalink?: string;
    limit?: number;
  }): Promise<MediaData[]> {
    const mediaData: MediaData[] = [];
    let nextPage:
      | string
      | null = `https://graph.instagram.com/me/media?fields=${fields.join(
      ",",
    )}&access_token=${accessToken}`;

    this.logger.info(`Fetching media from Instagram with URL: ${nextPage}`);
    let limitNumber = 0;
    while (nextPage) {
      const response = await fetch(nextPage);
      const dataFromApi = await response.json();
      const initialData = RootSchema.parse(dataFromApi);
      const { data } = initialData;
      const extractedData = this.extractData(data);
      this.logger.info(`Extracted data: ${JSON.stringify(extractedData)}`);
      if (data) {
        if (extractedData && extractedData.length > 0) {
          if (postPermalink && !limit) {
            const foundPost = extractedData.find(
              (item) => item.permalink === postPermalink,
            );
            if (foundPost) {
              this.logger.info(`Found post: ${JSON.stringify(foundPost)}`);
              return [foundPost];
            }
          } else {
            if (limitNumber <= limit) {
              mediaData.push(...extractedData.slice(0, limit - limitNumber));
              limitNumber += extractedData.length;
            } else {
              return mediaData;
            }
          }
        }
        nextPage =
          initialData.paging && initialData.paging.next
            ? initialData.paging.next
            : null;
      } else {
        nextPage = null;
      }
    }
    return mediaData;
  }

  async getSpecificNumberOfPostsFromInstagram({
    accessToken,
    postLimit = 100,
  }: {
    accessToken: string;
    postLimit?: number;
  }): Promise<MediaData[]> {
    const parentMedia = await this.getAllParentMediaFromInstagram({
      accessToken,
      limit: postLimit,
    });
    return parentMedia;
  }

  async searchPostsFromInstagram({
    accessToken,
    postPermalink,
    includeChildren = false,
  }: {
    accessToken: string;
    postPermalink: string;
    includeChildren?: boolean;
  }): Promise<MediaData[]> {
    const parentMedia = await this.getAllParentMediaFromInstagram({
      accessToken,
      postPermalink,
    });
    if (!includeChildren) {
      return parentMedia;
    }
    const parentMediaWithChildren = await Promise.all(
      parentMedia.map(async (item) => {
        const childrenMedia = await this.getChildrenMediaFromInstagram({
          accessToken,
          parentPostId: item.id,
          parentCaption: item.caption,
        });
        return {
          ...item,
          childrenMedia,
        };
      }),
    );
    return parentMediaWithChildren;
  }

  async getParentAndChildrenMediaFromInstagram({
    accessToken,
  }: {
    limit?: number;
    accessToken: string;
  }): Promise<MediaData[]> {
    const parentMedia = await this.getAllParentMediaFromInstagram({
      accessToken,
    });
    const parentMediaWithChildren = await Promise.all(
      parentMedia.map(async (item) => {
        const childrenMedia = await this.getChildrenMediaFromInstagram({
          accessToken,
          parentPostId: item.id,
          parentCaption: item.caption,
        });
        return {
          ...item,
          childrenMedia,
        };
      }),
    );
    return parentMediaWithChildren;
  }

  async getChildrenMediaFromInstagram({
    fields = ["id", "media_type", "media_url", "permalink", "timestamp"],
    accessToken,
    parentPostId,
    parentCaption = "",
  }: {
    fields?: string[];
    accessToken: string;
    parentPostId: string;
    parentCaption?: string;
  }): Promise<MediaData[]> {
    const mediaData: MediaData[] = [];
    const url = `https://graph.instagram.com/${parentPostId}/children?fields=${fields.join(
      ",",
    )}&access_token=${accessToken}`;
    const response = await fetch(url);
    const dataFromApi = await response.json();
    const initialData = ChildRootSchema.parse(dataFromApi);
    const { data } = initialData;
    const extractedData = this.extractData(data);

    if (data) {
      if (extractedData && extractedData.length > 0) {
        mediaData.push(...extractedData);
      }
    }
    if (parentCaption && parentCaption.length > 0) {
      mediaData.forEach((item) => {
        item.caption = parentCaption;
      });
    }
    return mediaData;
  }
}
