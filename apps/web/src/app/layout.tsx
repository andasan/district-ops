import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const opsSans = Noto_Sans_JP({
  variable: "--font-ops-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const opsMono = IBM_Plex_Mono({
  variable: "--font-ops-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "District Ops",
  description:
    "Multi-tenant K-12 ops console scaffold: Next.js + ASP.NET Core + ReBAC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${opsSans.variable} ${opsMono.variable} antialiased`}>
        {/*
          THESIS: Packed institutional ops mosaic — hairline modules and utility-red tabs — not soft SaaS card stacks.
          OWN-WORLD: Japanese high-density web; #FFF/#111/#E60012; Noto Sans JP; ruled modules; depressed active rail.
          STORY: See a serious District Ops console where persona/ReBAC and async job stamps are the product.
          FIRST VIEWPORT: Fixed left rail (01–03) + top title band; persona + enrollment modules; dense stamped workflow table.
          FORM: Japanese High-Density Web · challenger wins · seed 57781702.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        {children}
      </body>
    </html>
  );
}
