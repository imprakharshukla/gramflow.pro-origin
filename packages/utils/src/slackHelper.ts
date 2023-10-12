import * as fs from "fs";
import TelegramBot from "node-telegram-bot-api";

export async function sendMessageWithSectionsAndImages(
  orderDetails: string,
  userDetails: string,
  images: string[],
  slackWebhookUrl: string,
): Promise<void> {
  if (process.env.ENV === "dev") {
    return;
  }
  const message = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*New Order*\n\n" + orderDetails,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*User Details*\n\n" + userDetails,
        },
      },
      ...images.map((imageUrl) => ({
        type: "image",
        image_url: imageUrl,
        alt_text: "Image",
      })),
    ],
  };

  try {
    const response = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log("Message sent successfully");
    } else {
      console.error("Error sending message:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export async function uploadFileToFIleIo(
  fileContent: Buffer,
  fileName: string,
): Promise<string> {
  try {
    // upload file as multipart/form-data
    //create form data
    const formData = new FormData();
    //convert buffer to blob

    const file = new Blob([fileContent], { type: "text/csv" });
    console.log({ file });
    formData.append("file", file, fileName);
    formData.append("expires", "1w");

    const response = await fetch("https://file.io/", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse.key;
    } else {
      console.log({ response });
      console.error("Error uploading file to File.ios:", response.statusText);
      return "";
    }
  } catch (error) {
    console.error("Error uploading file to File.io:", error);
    return "";
  }
}

export async function sendMessageToSlackWithFileLink(
  msg: string,
  slackWebhookUrl: string,
): Promise<void> {
  const message = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: msg,
        },
      },
    ],
  };

  try {
    const response = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log("Message sent successfully");
    } else {
      console.error("Error sending message to Slack:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending message to Slack:", error);
  }
}

export async function sendFileToTelegram(
  fileName: string,
  telegramBotToken: string,
  telegramChatId: string,
): Promise<string> {
  try {
    // No need to pass any parameters as we will handle the updates with Express
    console.log({ telegramBotToken, telegramChatId });
    const bot = new TelegramBot(telegramBotToken);

    // This informs the Telegram servers of the new webhook.
    await bot.setWebHook(`https://api.telegram.org/bot${telegramBotToken}`);

    const response = await bot.sendDocument(telegramChatId, fileName);
    console.log({ response });
    const file_id = response.document?.file_id;
    console.log({ file_id });
    const fileInfo = await bot.getFile(file_id ?? "");
    console.log({ fileInfo });
    return `https://api.telegram.org/file/bot${telegramBotToken}/${fileInfo.file_path}`;
  } catch (error) {
    console.error("Error sending file to Telegram:", error);
    return "";
  }
}
