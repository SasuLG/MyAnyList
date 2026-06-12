

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

import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const mode = cookieStore.get("darkMode")?.value === "true" ? "dark-mode" : "";
  return (
    <html lang="fr" suppressHydrationWarning={true} className={mode}>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <title>MyAnyList</title>
        <meta name="theme-color" content="#ffffff" />
      </head>
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