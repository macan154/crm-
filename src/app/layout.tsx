import type { Metadata } from "next";
import { Days_One, Onest } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
});

const days = Days_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-days",
});

export const metadata: Metadata = {
  title: "Центр по работе со спонсорами",
  description: "CRM Центра спонсоров СГУПС",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${onest.variable} ${days.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
