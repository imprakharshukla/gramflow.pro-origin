import { type SiteConfig } from "types";

import { AppConfig } from "@acme/utils";

export const siteConfig: SiteConfig = {
  name: AppConfig.OrderWebsiteDetails.name,
  description: AppConfig.OrderWebsiteDetails.description,
  url: AppConfig.OrderWebsiteDetails.url,
};
