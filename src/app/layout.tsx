// Assurez-vous que ce fichier est en mode client
"use client";

import { Inter } from "next/font/google";
import { UserContextProvider } from "@/userContext";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

  useEffect(() => {
    let docTitle = document.title;
    const handleBlur = () => {
      document.title = "reviens bebou";
    };
    const handleFocus = () => {
      document.title = docTitle;
    };
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
  
  // Utilisation de usePathname pour déterminer le chemin actuel
  const pathname = usePathname();
  const shouldShowFooter = pathname ? !pathname.startsWith('/admin') : true;
  const hide = pathname ? pathname.startsWith('/404') : false;
  return (
    <html lang="fr">
      <body className={inter.className}>
        <UserContextProvider>
          <div style={{ height: "100%" }}>
            {!hide && <Header />}
            {children}
            {shouldShowFooter && !hide && <Footer />}
          </div>
        </UserContextProvider>
      </body>
    </html>
  );
}

/*
  // Utilisation de usePathname pour déterminer le chemin actuel
  const pathname = usePathname();
  const shouldShowFooter = pathname ? !pathname.startsWith('/admin') : true;
  const [hide, setHide] = useState(false);
  useEffect(() => {
    let docTitle = document.title;
    const handleBlur = () => {
      document.title = "reviens bebou";
    };
    const handleFocus = () => {
      document.title = docTitle;
    };
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    const is404 = document.querySelector(".error-page") !== null;
    setHide(is404);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };

  }, []);

*/