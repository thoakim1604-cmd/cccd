import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CCCD Scanner - Chuyển Căn cước công dân sang Excel",
  description:
    "Ứng dụng OCR chuyển đổi thông tin từ ảnh Căn cước công dân Việt Nam sang file Excel. Hỗ trợ nhận diện tự động Họ tên, Ngày sinh, Địa chỉ, Ngày cấp, Cơ quan cấp.",
  keywords: [
    "CCCD",
    "căn cước công dân",
    "OCR",
    "Excel",
    "PaddleOCR",
    "Vietnam ID card",
  ],
  authors: [{ name: "CCCD Scanner" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
