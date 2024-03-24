import { TailwindIndicator } from "@gramflow/ui";
import { cn } from "@gramflow/utils";

import { siteConfig } from "~/config/site";
import { fontSans } from "~/lib/fonts";
import localFont from 'next/font/local'

import { ThemeProvider } from "~/providers/theme-provider";
import "~/styles/globals.css";
import { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Provider as JotainProvider } from "jotai";
import { PageLoaderProvider } from "~/providers/page-loader-provider";
import QueryProvider from "~/providers/query-provider";
import { DayPickerProvider } from "react-day-picker";
import { AuthSessionProvider } from "~/providers/auth-session-provider";

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
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon.ico",
        href: "/favicon.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon-dark.ico",
        href: "/favicon-dark.ico",
      },
    ],
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <
      AuthSessionProvider
    >
      <html lang="en" suppressHydrationWarning>
        <QueryProvider>
          <head />
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
            )}
          >
            <main className={fontSans.className}>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                <JotainProvider>

                  <Toaster theme="dark" />
                  <PageLoaderProvider>
                    <div className={`relative flex min-h-screen flex-col`}>
                      {children}
                    </div>
                  </PageLoaderProvider>
                </JotainProvider>
              </ThemeProvider>
              <TailwindIndicator />
            </main>
          </body>
        </QueryProvider>
      </html>
    </AuthSessionProvider >
  );
}
