import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "AML Screening Analyst Studio",
  description: "Multi-agent adverse media screening assistant for analysts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
