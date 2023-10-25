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
} from "@react-email/components";

import { AppConfig } from "@gramflow/utils";

export const OtpEmail = ({ otp = "0000" }: { otp: string }) => {
  return (
    <Html>
      <Head />
      <Preview>
       Your OTP from {AppConfig.StoreName} (@{AppConfig.InstagramUsername}) is {otp}.
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`${AppConfig.BaseOrderUrl}/cl_email_logo.png`}
                height="80"
                alt={`${AppConfig.StoreName} Logo`}
                className="mx-auto my-0"
              />
              <Heading className="pt-3 text-center text-2xl">
                Here is your OTP
              </Heading>
              <Text className="text-center text-xs text-gray-500">
                Please use this OTP to verify your email address.
              </Text>
            </Section>
            <Hr />
            <Section className="mx-auto gap-2">
              <Section style={codeContainer}>
                <Text style={code}>{otp}</Text>
              </Section>
            </Section>
            <Hr />

            <Section>
              <Text className="-mb-2 font-semibold">Not Requested?</Text>
              <Text className="text-sm text-gray-500">
                If you have not requested the OTP, please let us know at {" "}
                <Link
                  className="text-pink-600 underline"
                  href={`https://instagram.com/${AppConfig.InstagramUsername}`}
                >
                  @re_skinn
                </Link>
                .
              </Text>
            </Section>
            <Hr className="-mb-2 mt-6" />
            <Section style={paddingY}>
                         <Img
                src={`${AppConfig.BaseOrderUrl}/cl_email_logo.png`}
                height="80"
                alt={`${AppConfig.StoreName} Logo`}
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
                © {new Date().getFullYear()} {AppConfig.StoreName}, All Rights
                Reserved.
              </Text>
              <Text style={footer.text}>
                {AppConfig.StoreName}, {AppConfig.WarehouseDetails.city},{" "}
                {AppConfig.WarehouseDetails.state},{" "}
                {AppConfig.WarehouseDetails.country}.
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
