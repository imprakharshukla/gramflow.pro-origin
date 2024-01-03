import { type SiteConfig } from "types";

import { AppConfig } from "@gramflow/utils";

export const siteConfig: SiteConfig = {
  name: AppConfig.AdminWebsiteDetails.name,
  description: AppConfig.AdminWebsiteDetails.description,
  url: AppConfig.AdminWebsiteDetails.url,
};
