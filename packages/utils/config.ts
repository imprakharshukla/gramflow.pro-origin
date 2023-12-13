import { AppConfig as Config } from "./config.mjs";

export type GramflowConfig = {
  MasterEmails: string[];
  AdminEmails: string[];
  StoreName: string;
  logo: string;
  ReturnAddress: {
    house_number: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone_no: string;
    name: string;
  };
  DefaultPaymentMode: string;
  DefaultPackageDetails: {
    [key: string]: {
      weight: string;
      length: string;
      breadth?: string;
      color: string;
      height?: string;
      charge: string;
      payment_mode: string;
    };
  };
  WarehouseDetails: {
    house_number: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone_no: string;
    name: string;
    email: string;
  };
  OrderWebsiteDetails: {
    name: string;
    description: string;
    url: string;
  };
  AdminWebsiteDetails: {
    name: string;
    description: string;
    url: string;
  };
  InstagramUsername: string;
  BaseAdminUrl: string;
  BaseOrderUrl: string;
  ImageBaseUrl: string;
  BaseStoreUrl: string;
  Domain: string;
};

export const AppConfig: GramflowConfig = {
  ...Config,
};
