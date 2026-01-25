import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FarcasterProvider from "@/components/farcaster-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FrameCaster",
  description: "Launch coins on Zora via Farcaster",
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image`,
      button: {
        title: "Launch App",
        action: {
          type: "launch_frame",
          name: "FrameCaster",
          url: process.env.NEXT_PUBLIC_APP_URL,
          splashImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vercel.svg`,
          splashBackgroundColor: "#000000",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-background text-foreground antialiased min-h-screen")}>
        <FarcasterProvider>
          <div className="mx-auto max-w-md min-h-screen border-x bg-background relative overflow-hidden shadow-2xl">
             {children}
          </div>
        </FarcasterProvider>
      </body>
    </html>
  );
}
