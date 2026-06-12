import "./globals.css";

export const metadata = {
  title: "Muslim Travel Market Intelligence Dashboard",
  description: "Market intelligence dashboard using public Muslim travel sources.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
