import { TailwindIndicator } from "@gramflow/ui";
import { cn } from "@gramflow/utils";

import { siteConfig } from "~/config/site";
import { fontSans } from "~/lib/fonts";
import { AuthSessionProvider } from "~/providers/auth-session-provider";
import { ThemeProvider } from "~/providers/theme-provider";
import "~/styles/globals.css";
import { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font";
import posthog from "posthog-js";
import { Toaster } from "sonner";
import { env } from "~/env.mjs";
import Footer from "~/features/ui/components/footer";
import NavMenu from "~/features/ui/components/navMenu";
import PHProvider from "~/providers/posthog-provider";
import QueryProvider from "~/providers/query-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/base_og.png`],
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/base_og.png`],
    creator: `@${siteConfig.name}`,
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.className,
        )}
      >
        <AuthSessionProvider>
            <QueryProvider>
              <PHProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                >
                  <Toaster theme="dark" />
                  <NavMenu />
                  <div
                    className={
                      "relative flex min-h-screen flex-col " + fontSans.className
                    }
                  >
                    {children}
                  </div>
                  <Footer />
                </ThemeProvider>
              </PHProvider>
              <TailwindIndicator />
            </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
