// Assurez-vous que ce fichier est en mode client
"use client";

import { Inter } from "next/font/google";
import { UserContextProvider } from "@/userContext";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { usePathname } from "next/navigation";

import "./globals.css";
import "@/styles/footer.style.css";
import "@/styles/header.style.css";
import "@/styles/login.style.css";
import "@/styles/series.style.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Utilisation de usePathname pour déterminer le chemin actuel
  const pathname = usePathname();
  const shouldShowFooter = pathname ? !pathname.startsWith('/admin') : true;

  return (
    <html lang="fr">
      <body className={inter.className}>
        <UserContextProvider>
          <div style={{ height: "100%" }}>
            <Header />
            {children}
            {shouldShowFooter && <Footer />}
          </div>
        </UserContextProvider>
      </body>
    </html>
  );
}
