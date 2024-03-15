import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  render,
} from "@react-email/components";
import { z } from "zod";
import { EmailBaseZodSchema } from "./schema";

const OtpEmailZodSchema = EmailBaseZodSchema.extend({
  otp: z.string().optional(),
  loginLink: z.string().optional(),
})

const OtpEmail = (emailDetails: z.infer<typeof OtpEmailZodSchema>) => {
  return (
    <Html>
      <Head />
      {emailDetails.otp ?
        <Preview>
          Your OTP from {emailDetails.storeName} (@{emailDetails.storeInstagramUsername}) is {emailDetails.otp}.
        </Preview>
        : <Preview>Continue with your {emailDetails.storeName}'s order</Preview>
      }
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`${emailDetails.baseOrderUrl}/cl_email_logo.png`}
                height="80"
                alt={`${emailDetails.storeName} Logo`}
                className="mx-auto my-0"
              />
              <Heading className="pt-3 text-center text-2xl">
                {emailDetails.otp ? "Here is your OTP" : "Continue with your order"}
              </Heading>
              <Text className="text-center text-xs text-gray-500">
                {emailDetails.otp ? "Please use this OTP to verify your email address." : "Please click the button below to continue with your order."}
              </Text>
            </Section>
            <Hr />
            {emailDetails.otp ?
              <Section className="mx-auto gap-2">
                <Section style={codeContainer}>
                  <Text style={code}>{emailDetails.otp}</Text>
                </Section>
              </Section> : <Button className="mx-auto" href={emailDetails.loginLink}>Continue with your order</Button>
            }
            <Hr />

            <Section>
              <Text className="-mb-2 font-semibold">Not Requested?</Text>
              <Text className="text-sm text-gray-500">
                If you have not requested the {emailDetails.otp ? "OTP" : "link"}, please let us know at {" "}
                <Link
                  className="text-pink-600 underline"
                  href={`https://instagram.com/${emailDetails.storeInstagramUsername}`}
                >
                  @re_skinn
                </Link>
                .
              </Text>
            </Section>
            <Hr className="-mb-2 mt-6" />
            <Section style={paddingY}>
              <Img
                src={`${emailDetails.baseOrderUrl}/cl_email_logo.png`}
                height="80"
                alt={`${emailDetails.storeName} Logo`}
                className="mx-auto my-0 shadow rounded-full"
              />
              <Row>
                <Column align="center">
                  <Text style={categories.special}>A Thrift Store</Text>
                </Column>
              </Row>
              <Row style={categories.container}>
                <Column align="center">
                  <Text style={categories.special} className="font-normal">
                    Thank you for shopping with us!
                  </Text>
                </Column>
              </Row>
            </Section>
            <Hr style={{ ...global.hr, marginTop: "8px" }} />
            <Section style={paddingY}>
              <Text
                style={{ ...footer.text, paddingTop: 30, paddingBottom: 30 }}
              >
                Please contact us if you have any questions. (If you reply to
                this email, we won't be able to see it)
              </Text>
              <Text style={footer.text}>
                © {new Date().getFullYear()} {emailDetails.storeName}, All Rights
                Reserved.
              </Text>
              <Text style={footer.text}>
                {emailDetails.storeName}, {emailDetails.warehouseCity},{" "}
                {emailDetails.warehouseState},{" "}
                {emailDetails.warehouseCountry}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
export default OtpEmail;

const paddingX = {
  paddingLeft: "40px",
  paddingRight: "40px",
};

const paddingY = {
  paddingTop: "22px",
  paddingBottom: "22px",
};

const paragraph = {
  margin: "0",
  lineHeight: "2",
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};

const code = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Bold",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",
  paddingX: "8px",
  margin: "0 auto",
  width: "100%",
  textAlign: "center" as const,
};

const global = {
  paddingX,
  paddingY,
  defaultPadding: {
    ...paddingX,
    ...paddingY,
  },
  paragraphWithBold: { ...paragraph, fontWeight: "bold" },
  heading: {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: "-1px",
  } as React.CSSProperties,
  text: {
    ...paragraph,
    color: "#747474",
    fontWeight: "500",
  },
  button: {
    border: "1px solid #929292",
    fontSize: "16px",
    textDecoration: "none",
    padding: "10px 0px",
    width: "220px",
    display: "block",
    textAlign: "center",
    fontWeight: 500,
    color: "#000",
  } as React.CSSProperties,
  hr: {
    borderColor: "#E5E5E5",
    margin: "0",
  },
};

const recomendationsText = {
  margin: "0",
  fontSize: "15px",
  lineHeight: "1",
  paddingLeft: "10px",
  paddingRight: "10px",
};

const categories = {
  container: {
    width: "370px",
    margin: "auto",
    paddingTop: "12px",
  },
  text: {
    fontWeight: "500",
    color: "#000",
  },
  special: {
    marginTop: "-12px",
    fontWeight: "300",
    color: "#747474",
  },
};

const footer = {
  policy: {
    width: "166px",
    margin: "auto",
  },
  text: {
    margin: "0",
    color: "#AFAFAF",
    fontSize: "13px",
    textAlign: "center",
  } as React.CSSProperties,
};

export const OtpEmailHtml = ({
  emailDetails
}: {
  emailDetails: z.infer<typeof OtpEmailZodSchema>
}) => render(OtpEmail(emailDetails), {});