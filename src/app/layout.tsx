import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nouka Baich 3D",
  description:
    "A 3D boat racing game inspired by traditional Bangladeshi Nouka Baich.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nouka Baich 3D",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} h-full overflow-hidden overscroll-none antialiased`}
    >
      <body className="flex h-full min-h-0 flex-col overflow-hidden overscroll-none select-none">
        {children}
      </body>
    </html>
  );
}
