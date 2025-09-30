import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenImagine - Web Operating System",
  description: "A conversational web-based operating system interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
