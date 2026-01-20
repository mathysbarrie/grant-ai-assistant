import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grant AI Assistant",
  description: "AI-powered grant analysis for municipalities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
