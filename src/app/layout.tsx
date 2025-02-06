import "./global.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata = {
  title: "IIDX ギアチェン計算機",
  description: "鍵盤ギアチェン時の緑数字を計算します",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja-JP">
      <body>{children}</body>
    </html>
  )
}
