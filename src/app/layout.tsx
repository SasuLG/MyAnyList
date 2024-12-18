"use client";

import { Inter } from "next/font/google";
import { UserContextProvider } from "@/userContext";
import "./globals.css";
import "@/styles/footer.style.css";
import "@/styles/header.style.css";
import "@/styles/login.style.css";
import "@/styles/series.style.css";
import "@/styles/loader.style.css";
import "@/styles/dropdown.style.css";
import "@/styles/slider.style.css";
import "@/styles/admin.style.css";
import "@/styles/alert.box.style.css";
import "@/styles/popup.style.css";
import "@/styles/slider.caroussel.style.css";
import "@/styles/tierlist.style.css";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr">
      <body className={inter.className}>
        <UserContextProvider>
          <div className="main">
            {children}
          </div>
        </UserContextProvider>
      </body>
    </html>
  );
}