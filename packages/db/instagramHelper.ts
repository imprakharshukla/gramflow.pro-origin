interface MediaData {
  id: string;
  media_url: string;
  permalink: string;
}

async function fetchMediaDataOfParent(
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
      const response = await fetch(nextPage);
      const data = await response.json();

      if (data.data) {
        const temp = data.data.find(
          (item: MediaData) => item.permalink === targetPermalink,
        );
        if (temp) {
          const child = await fetchMediaDataWithPagination(
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

async function fetchMediaDataWithPagination(
  mediaData: MediaData,
  index: number,
  accessToken: string,
): Promise<MediaData> {
  const mediaDataWithPagination: MediaData[] = [];

  let nextPage:
    | string
    | null = `https://graph.instagram.com/v17.0/${mediaData.id}/children?fields=id,media_url,permalink&access_token=${accessToken}`;
  while (nextPage) {
    const response = await fetch(nextPage);
    const data = await response.json();

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

function extractPostIdFromUrl(url: string): string | null {
  const regex = /https:\/\/www\.instagram\.com\/p\/([a-zA-Z0-9_-]+)\/.*/;
  const match = url.match(regex);
  // @ts-ignore
  return match ? match[1] : null;
}

function extractIndexNumberFromUrl(url: string): number {
  const regex =
    /https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+\/\?img_index=([0-9]+)/;
  const match = url.match(regex);
  // @ts-ignore
  return match ? parseInt(match[1]) : 0;
}

export const fetchImageUrls = (urls: string[]): Promise<string[]> => {
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
      (url) => `https://www.instagram.com/p/${extractPostIdFromUrl(url)}/`,
    );
    const permalinksWithIndex = urls.map((url) =>
      extractIndexNumberFromUrl(url),
    );

    console.log("Permalinks:", permalinks);
    console.log("Permalinks with Index:", permalinksWithIndex);

    fetchMediaDataOfParent(permalinksWithIndex, permalinks, accessToken)
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
