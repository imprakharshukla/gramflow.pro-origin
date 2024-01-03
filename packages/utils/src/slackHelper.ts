
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
