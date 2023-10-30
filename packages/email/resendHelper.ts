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
  return new Promise(async (resolve, reject) => {
    await fetch("https://api.resend.com/emails", {
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
    })
      .then((res) => resolve(res.json()))
      .catch((err) => reject(err));
  });
};
