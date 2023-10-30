export const SendEmailViaResend = async ({
  from,
  to,
  html,
  subject,
  RESEND_API_KEY,
}: {
  from: string;
  to: string[];
  html: string;
  subject: string;
  RESEND_API_KEY: string;
}) => {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Error sending email:", response.statusText);
      throw new Error("Error sending email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};
