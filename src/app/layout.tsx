import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Victor Sierra CRM",
  description: "Victor Sierra internal CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
