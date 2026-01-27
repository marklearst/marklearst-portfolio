import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mark Learst - Principal Design Engineer",
  description:
    "Building design systems, developer tools, React components, WCAG compliant accessibility, health tech, and OSS projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/AntiqueCon-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
