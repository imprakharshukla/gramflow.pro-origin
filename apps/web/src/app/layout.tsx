import { TailwindIndicator } from "@gramflow/ui";
import { cn } from "@gramflow/utils";

import { siteConfig } from "~/config/site";
import { fontSans } from "~/lib/fonts";
import { AuthSessionProvider } from "~/providers/auth-session-provider";
import { ThemeProvider } from "~/providers/theme-provider";
import "~/styles/globals.css";
import { Metadata } from "next";
import { GeistSans } from "geist/font";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { Toaster } from "sonner";

import { env } from "~/env.mjs";
import NavMenu from "~/features/ui/components/navMenu";
import QueryProvider from "~/providers/query-provider";

export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/cl_og.jpg`],
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/cl_og.jpg`],
    creator: "@",
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: false,
    },
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
  if (typeof window !== "undefined") {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    });
  }
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
            <PostHogProvider client={posthog}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <Toaster />
                <NavMenu />
                <div
                  className={
                    "relative flex min-h-screen flex-col " + fontSans.className
                  }
                >
                  {children}
                </div>
              </ThemeProvider>
            </PostHogProvider>
            <TailwindIndicator />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
