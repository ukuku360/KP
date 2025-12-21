import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({ 
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "정치 커뮤니티 플랫폼",
  description: "정치적 이슈에 대한 투명하고 건설적인 논의 공간",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
