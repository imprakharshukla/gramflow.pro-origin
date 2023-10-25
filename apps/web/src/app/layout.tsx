
import {TailwindIndicator} from "@gramflow/ui";
import {cn} from "@gramflow/utils";

import {siteConfig} from "~/config/site";
import {fontSans} from "~/lib/fonts";
import {AuthSessionProvider} from "~/providers/auth-session-provider";
import {ThemeProvider} from "~/providers/theme-provider";
import "~/styles/globals.css";
import QueryProvider from "~/providers/query-provider";
import {Toaster} from 'react-hot-toast';
import {Metadata} from "next";



export const metadata:Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    {media: "(prefers-color-scheme: light)", color: "white"},
    {media: "(prefers-color-scheme: dark)", color: "black"},
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


  return (
    <html lang="en" suppressHydrationWarning>
    <head/>
    <body
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable,
      )}
    >
    <AuthSessionProvider>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster/>

          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>

        </ThemeProvider>

        <TailwindIndicator/>
      </QueryProvider>
    </AuthSessionProvider>
    </body>
    </html>
  );
}
