import {
  JetBrains_Mono as FontMono,
  Inter as FontSans,
  Playfair_Display as FontSerif,
} from "next/font/google";

export const fontSerif = FontSerif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: false,
});

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: false,
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  adjustFontFallback: false,
  display: 'swap'
});
