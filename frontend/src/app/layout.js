import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Travel Planner",
  description: "Multi-agent AI travel planning with human-in-the-loop approval",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="pt-20 min-h-screen pb-16">{children}</main>
      </body>
    </html>
  );
}
