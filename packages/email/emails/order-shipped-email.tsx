import * as React from "react";
import {
  Body,
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
  Text,
} from "@react-email/components";
import { format } from "date-fns";

import { CompleteOrders } from "@acme/db/prisma/zod";
import { AppConfig } from "@acme/utils";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

const defaultOrder = {
  id: "7bd099e6-b463-4698-bed8-56d3450c02e2",
  instagram_post_urls: [
    "https://www.instagram.com/p/CyTQHfjvtDE/?img_index=2&price=850",
    "https://www.instagram.com/p/CyTQHfjvtDE/?img_index=2&price=850",
  ],
  user_id: "cbbe5b5b-4466-4c9d-a6d3-2c687faedabe",
  price: 850,
  status: "DELIVERED",
  courier: "DEFAULT",
  images: [
    "https://images.reskinn.store/clnn8az1h0002lc0fcvvj789s_0.jpg",
    "https://images.reskinn.store/clnn8az1h0002lc0fcvvj789s_0.jpg",
  ],
  awb: "24478910001013",
  created_at: "2023-10-14T14:58:33.385Z",
  updated_at: "2023-10-18T06:48:03.961Z",
  length: "0",
  breadth: "0",
  height: "0",
  weight: "0",
  user: {
    id: "cbbe5b5b-4466-4c9d-a6d3-2c687faedabe",
    name: "Ayushi",
    email: "ayushimaurya2003@gmail.com",
    house_number: "World University of Design",
    pincode: "131029",
    landmark: "Beside Ashoka University",
    locality: "Rajiv Gandhi Educational City",
    instagram_username: "i._.youshe",
    city: "Sonipat",
    state: "Haryana",
    country: "India",
    phone_no: "9634773128",
    created_at: "2023-10-14T15:01:15.460Z",
    updated_at: "2023-10-14T15:01:15.460Z",
  },
};

export const NikeReceiptEmail = ({
  order = defaultOrder,
}: {
  order: CompleteOrders;
}) => (
  <Html>
    <Head />
    <Preview>Get your order summary, estimated delivery date and more</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={track.container}>
          <Row>
            <Column>
              <Text style={global.paragraphWithBold}>Tracking Number</Text>
              <Text style={track.number}>{order.awb}</Text>
            </Column>
            <Column align="right">
              <Link
                href={`delhivery.com/track/package/${order.awb}`}
                style={global.button}
              >
                Track Package
              </Link>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
        <Section style={message}>
          <Img
            src={`${AppConfig.BaseAdminUrl}/cl_logo.svg`}
            width="100"
            height="60"
            alt="Reskinn"
            style={{ margin: "auto" }}
          />
          <Heading style={global.heading}>It's On Its Way.</Heading>
          <Text style={global.text}>
            You order is on its way. Use the link above to track its progress.
          </Text>
          <Text style={{ ...global.text, marginTop: 24 }}>
            We hope that you will love your product 💗. The order is securely
            packaged and will arrive very soon.
          </Text>
        </Section>
        <Hr style={global.hr} />
        <Section style={global.defaultPadding}>
          <Text style={addressTitle}>Shipping to: {order.user?.name}</Text>
          <Text style={{ ...global.text, fontSize: 14 }}>
            {order.user?.house_number}, {order.user?.landmark},{" "}
            {order.user?.city}, , {order.user?.state}, {order.user?.country}-{" "}
            {order.user?.pincode}
          </Text>
        </Section>
        <Hr style={global.hr} />
        <Section
          style={{ ...paddingX, paddingTop: "40px", paddingBottom: "40px" }}
        >
          {order.instagram_post_urls.map((url, index) => (
            <Row style={{ marginTop: "20px" }}>
              <Column>
                <Img
                  src={order.images[index]}
                  alt={order.instagram_post_urls[index]}
                  style={{ float: "left" }}
                  width="150px"
                />
              </Column>
              <Column style={{ verticalAlign: "top", paddingLeft: "12px" }}>
                <Text style={{ ...paragraph, fontWeight: "500" }}>
                  Product {index + 1}
                </Text>
                <Text style={global.text}>{url.split("&")[0]}</Text>
              </Column>
            </Row>
          ))}
        </Section>
        <Hr style={global.hr} />
        <Section style={global.defaultPadding}>
          <Row style={{ display: "inline-flex", marginBottom: 40 }}>
            <Column style={{ width: "350px" }}>
              <Text style={global.paragraphWithBold}>Order Number</Text>
              <Text style={track.number}>{order.id}</Text>
            </Column>
            <Column>
              <Text style={global.paragraphWithBold}>Order Date</Text>
              <Text style={track.number}>
                {format(
                  new Date(order.created_at ?? new Date()),
                  "dd/MM/yy, hh:mm a",
                )}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column align="center">
              <Link
                style={global.button}
                href={`delhivery.com/track/package/${order.awb}`}
              >
                Order Status
              </Link>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
        <Hr style={global.hr} />
        <Section style={menu.container}>
          <Text style={menu.title}>Get Help</Text>
          <Row style={menu.content}>
            <Column style={{ width: "33%" }} colSpan={1}>
              <Link href="https://instagram.com/re_skinn" style={menu.text}>
                Instagram
              </Link>
            </Column>
            <Column style={{ width: "33%" }} colSpan={1}>
              <Link href="mailto:hello@reskinn.store" style={menu.text}>
                Email
              </Link>
            </Column>
            <Column style={{ width: "33%" }} colSpan={1}>
              <Link href="telephone:9927472892" style={menu.text}>
                Phone
              </Link>
            </Column>
          </Row>
          <Hr style={global.hr} />
          <Row style={menu.tel}>
            <Column>
              <Row>
                <Column style={{ width: "16px" }}>
                  <Img
                    src={`https://upload.wikimedia.org/wikipedia/commons/3/3e/Instagram_simple_icon.svg`}
                    width="16px"
                    height="26px"
                    style={{ paddingRight: "14px" }}
                  />
                </Column>
                <Column>
                  <Text style={{ ...menu.text, marginBottom: "0" }}>
                    @re_skinn
                  </Text>
                </Column>
              </Row>
            </Column>
            <Column>
              <Text
                style={{
                  ...menu.text,
                  marginBottom: "0",
                }}
              >
                8 am - 11 pm IST
              </Text>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
        <Section style={paddingY}>
          <Text style={global.heading}>Reskinn.store</Text>
          <Row style={categories.container}>
            <Column align="center">
              <Text style={categories.special}>A Thrift Store</Text>
            </Column>
          </Row>
        </Section>
        <Hr style={{ ...global.hr, marginTop: "12px" }} />
        <Section style={paddingY}>
          <Row style={footer.policy}>
            <Column>
              <Text style={footer.text}>Web Version</Text>
            </Column>
            <Column>
              <Text style={footer.text}>Privacy Policy</Text>
            </Column>
          </Row>
          <Text style={{ ...footer.text, paddingTop: 30, paddingBottom: 30 }}>
            Please contact us if you have any questions. (If you reply to this
            email, we won't be able to see it)
          </Text>
          <Text style={footer.text}>
            © {new Date().getFullYear()} Reskinn, All Rights Reserved.
          </Text>
          <Text style={footer.text}>Reskinn, Noida, Uttar Pradesh, India.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NikeReceiptEmail;

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

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "10px auto",
  width: "600px",
  border: "1px solid #E5E5E5",
};

const track = {
  container: {
    padding: "22px 40px",
    backgroundColor: "#F7F7F7",
  },
  number: {
    margin: "12px 0 0 0",
    fontWeight: 500,
    lineHeight: "1.4",
    color: "#6F6F6F",
  },
};

const message = {
  padding: "40px 74px",
  textAlign: "center",
} as React.CSSProperties;

const addressTitle = {
  ...paragraph,
  fontSize: "15px",
  fontWeight: "bold",
};

const recomendationsText = {
  margin: "0",
  fontSize: "15px",
  lineHeight: "1",
  paddingLeft: "10px",
  paddingRight: "10px",
};

const recomendations = {
  container: {
    padding: "20px 0",
  },
  product: {
    verticalAlign: "top",
    textAlign: "left" as const,
    paddingLeft: "2px",
    paddingRight: "2px",
  },
  title: { ...recomendationsText, paddingTop: "12px", fontWeight: "500" },
  text: {
    ...recomendationsText,
    paddingTop: "4px",
    color: "#747474",
  },
};

const menu = {
  container: {
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingTop: "20px",
    backgroundColor: "#F7F7F7",
  },
  content: {
    ...paddingY,
    paddingLeft: "20px",
    paddingRight: "20px",
  },
  title: {
    paddingLeft: "20px",
    paddingRight: "20px",
    fontWeight: "bold",
  },
  text: {
    fontSize: "13.5px",
    marginTop: 0,
    fontWeight: 500,
    color: "#000",
  },
  tel: {
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingTop: "32px",
    paddingBottom: "22px",
  },
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
