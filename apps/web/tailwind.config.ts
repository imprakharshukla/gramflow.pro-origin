import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

import baseConfig from "@gramflow/tailwind-config";

export default withUt({
  content: [
    "./src/**/*.tsx",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{ts,tsx,mdx}",
  ],
  presets: [baseConfig],
  theme:{
    extend:{
      backgroundImage: {
        'bg': "url('/bg.png')",
      }
    }
  },
  plugins: [require("@tailwindcss/typography"),],
}) satisfies Config;
