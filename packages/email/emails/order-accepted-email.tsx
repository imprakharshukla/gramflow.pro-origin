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

const defaultOrder = {
  id: "7bd099e6-b463-4698-bed8-56d345sds2e2",
  instagram_post_urls: [
    "https://www.instagram.com/p/CyTQHfjvtDE/?img_index=2&price=850",
    "https://www.instagram.com/p/CyTQHfjvtDE/?img_index=2&price=850",
  ],
  user_id: "cbbe5b5b-4466-4c9d-a6d3-2c687faedabe",
  price: 850,
  status: "DELIVERED",
  courier: "DEFAULT",
  images: [
    `https://${AppConfig.ImageBaseUrl}/clnn8az1h0002lc0fcvvj789s_0.jpg`,
    `https://${AppConfig.ImageBaseUrl}/clnn8az1h0002lc0fcvvj789s_0.jpg`,
  ],
  awb: "24478913501013",
  created_at: "2023-10-14T14:58:33.385Z",
  updated_at: "2023-10-18T06:48:03.961Z",
  length: "0",
  breadth: "0",
  height: "0",
  weight: "0",
  user: {
    id: "cbbe5b5b-4466-4c9d-a6d3-2c687fsddabe",
    name: "John Doe",
    email: "johndoe@gmail.com",
    house_number: "John Residence",
    pincode: "131029",
    landmark: "Ashoka University",
    locality: "Rajiv Gandhi Educational City",
    instagram_username: "john_doe",
    city: "Sonipat",
    state: "Haryana",
    country: "India",
    phone_no: "9999999999",
    created_at: "2023-10-14T15:01:15.460Z",
    updated_at: "2023-10-14T15:01:15.460Z",
  },
};

export const OrderAcceptedEmail = ({
  id,
  awb,
  name,
  house_number,
  pincode,
  landmark,
  locality,
  city,
  state,
  country,
}: {
  id: string;
  awb: string;
  name: string;
  house_number: string;
  pincode: string;
  landmark: string;
  locality: string;
  city: string;
  state: string;
  country: string;
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        Your order from {AppConfig.StoreName} (@{AppConfig.InstagramUsername})
        is accepted!
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`${AppConfig.BaseOrderUrl}/cl_email_logo.png`}
                height="80"
                alt={`${AppConfig.StoreName} Logo`}
                className="mx-auto my-0 rounded-full shadow"
              />
              <Heading className="pt-3 text-center text-2xl">
                Your order has been accepted!
              </Heading>
              <Text className="text-center text-xs text-gray-500">
                Thank you for shopping with us, your order will soon be shipped
                🚚
              </Text>
            </Section>
            <Hr />
            <Section className="flex flex-col gap-2">
              <Text className="text-md font-semibold">Shipping To:</Text>
              <Text className="-mb-2 text-xs font-semibold">
                {name}
                {","}
              </Text>
              <Text className="text-xs text-gray-500">
                {house_number}
                {landmark ? `, ${landmark}` : ""}
                {","} {locality}
                {","} {city}
                {","} {state}
                {","} {country}
                {"-"} {pincode}
              </Text>

              <Button
                className="-mb-2 mb-4 rounded bg-pink-600 px-3 py-2 text-center text-sm font-medium text-white no-underline"
                href={`${AppConfig.BaseOrderUrl}/order/${id}}`}
              >
                View Order
              </Button>
              <Text className="-mb-2 text-xs font-semibold">Order ID{":"}</Text>
              <Text className="text-xs text-gray-500">{id}</Text>
            </Section>
            <Hr />

            <Section>
              <Text className="-mb-2 font-semibold">Get Help</Text>
              <Text className="text-sm text-gray-500">
                If you have any questions, please contact us at{" "}
                <Link
                  className="text-pink-600 underline"
                  href={`https://instagram.com/${AppConfig.InstagramUsername}`}
                >
                  @re_skinn
                </Link>
                .
              </Text>
            </Section>
            <Hr className="mt-6" />
            <Section style={paddingY}>
              <Img
                src={`${AppConfig.BaseOrderUrl}/cl_email_logo.png`}
                height="80"
                alt={`${AppConfig.StoreName} Logo`}
                className="mx-auto mb-5 rounded-full shadow"
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
export default OrderAcceptedEmail;

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
