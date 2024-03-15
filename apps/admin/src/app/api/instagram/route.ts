import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import { env } from "~/env.mjs";
import { prisma } from "~/lib/prismaClient";

const apiBaseUrl = "https://graph.instagram.com/v17.0/";

export interface ChildRoot {
  data: Child[];
}

export interface Child {
  media_url: string;
  media_type: string;
}

export interface Root {
  data: Daum[];
  paging: Paging;
}

export interface Daum {
  id: string;
  timestamp: string;
  media_url: string;
  caption: string;
  permalink: string;
}

export interface Paging {
  cursors: Cursors;
  next: string;
}

export interface Cursors {
  before: string;
  after: string;
}

// Function to extract data from the JSON response
function extractData(data: Daum[]) {
  if (data && data.length > 0) {
    extractedData.push(...data);
  }
}

interface FinalObject {
  [key: string]: { posts: string[]; caption: string; timestamp: string };
}

const finalData: FinalObject[] = [];

async function fetchParentData(parentPostId: string) {
  const apiUrl = `${apiBaseUrl}${parentPostId}/children?fields=media_type,media_url&access_token=${env.INSTAGRAM_TOKEN}`;
  console.log(apiUrl);
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for parent post ${parentPostId}`);
    }
    const data = (await response.json()) as ChildRoot;
    const arrayWithoutId = data.data
      .filter(({ media_type }) => media_type === "IMAGE")
      .map(({ media_url }) => media_url);
    console.log({ arrayWithoutId });
    return arrayWithoutId;
  } catch (error) {
    console.error(
      `Error fetching data for parent post ${parentPostId}:`,
      //@ts-ignore
      error.message,
    );
    return [];
  }
}

// Initialize an empty array to store the extracted data
const extractedData: {
  id: string;
  permalink: string;
  media_url: string;
  caption: string;
  timestamp: string;
}[] = [];

// Initialize an empty object to keep track of processed parent posts
const processedParents: Record<string, boolean> = {};

// Function to fetch the initial data
async function fetchInitialData(postNumber: number) {
  try {
    const initialUrl = `${apiBaseUrl}me/media?fields=id,media_url,caption,permalink,timestamp&access_token=${env.INSTAGRAM_TOKEN}`;
    const response = await fetch(initialUrl); // Fetch initial data
    const initialData = (await response.json()) as Root;
    const { data } = initialData;
    extractData(data.slice(0, postNumber)); // Extract data from the initial response

    for (const parent of extractedData) {
      const permalinkId = parent.permalink.split("/p/")[1]?.split("/")[0] ?? "";
      if (permalinkId.length === 0) {
        console.log(`${parent.permalink} is not a post`);
        continue;
      }
      if (!processedParents[permalinkId]) {
        const childData = await fetchParentData(parent.id);
        finalData.push({
          [permalinkId]: {
            posts: childData,
            caption: parent.caption,
            timestamp: parent.timestamp,
          },
        });
        processedParents[permalinkId] = true; // Mark this parent post as processed
      }
    }
  } catch (error) {
    console.error("Error fetching initial data:", error);
  }
}

export const GET = async (req: Request) => {
  try {
    // get the count from the query
    // await kv.set("total_posts", 84);

    const { searchParams } = new URL(req.url);
    const count = searchParams.get("count") ?? 0;
    if (!count) {
      return NextResponse.json({ error: "Count is required" });
    }
    console.log({ count });
    await fetchInitialData(Number(count));
    console.log("Final data:", JSON.stringify(finalData));

    for (const item of finalData) {
      for (const parent in item) {
        //check if the post exists
        const post = await prisma.posts.findUnique({
          where: {
            post_link: "https://www.instagram.com/p/" + parent,
          },
        });
        if (post) {
          console.log("Post already exists");
          continue;
        }
        await prisma.posts.create({
          data: {
            caption: item[parent]?.caption ?? "",
            slides: item[parent]?.posts ?? [],
            post_created_at: new Date(item[parent]?.timestamp ?? ""),
            post_link: "https://www.instagram.com/p/" + parent,
          },
        });
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
};
