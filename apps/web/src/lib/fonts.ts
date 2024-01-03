import {
  JetBrains_Mono as FontMono,
  Playfair_Display as FontSerif,
  Inter as FontSans,
} from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-sans",
});

export const fontSerif = FontSerif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: false,
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
