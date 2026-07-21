import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "./components/AppProviders";

export const metadata: Metadata = {
  title: {
    default: "Career Leader | Discover, plan, and act on your career",
    template: "%s | Career Leader",
  },
  description: "Discover fitting career paths, choose a goal, follow a practical roadmap, and connect with mentors in one guided workspace.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
