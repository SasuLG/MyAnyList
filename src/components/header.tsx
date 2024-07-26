"use client"
import { memo } from "react";
import Image from "next/image";
import { useUserContext } from "@/userContext";
import { API_LOGOUT_ROUTE } from "@/constants/api.route.const";
import { HOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE } from "@/constants/app.route.const";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header = memo(()=>{

    /**
     * React hook pour permettre la navigation entre les différents endpoints de l'application web.
     */
    const router = useRouter();

    /**
     * Hook qui permet de récupérer les informations de l'utilisateur connecté.
     */
    const {user, updateUserInfo, setAlert} = useUserContext();

    /**
     * Fonction qui permet de déconnecter l'utilisateur.
     */
    const logout = async () => {
        const response = await fetch(API_LOGOUT_ROUTE, { method: 'PUT' });
        const data = await response.json();
        setAlert(data);
        if (response.ok) {
            updateUserInfo();
            router.push(LOGIN_ROUTE);
        }
        return data;
    }
    
    return (
        <div className="header-container">
            <div className="header-content">
                <div className="header-items">
                    <Link href={HOME_ROUTE}>
                        <Image src="/assets/images/_73117bf0-c91e-4bb6-85f0-64563fc48a5c-removebg-preview.png" alt="logo" width={60} height={60}></Image>
                    </Link>
                </div>
                <div className="header-items">
                    <Link href="">Search</Link>
                    {user && (
                        <Link href="">My list</Link>
                    )}
                </div>
                <div className="header-items">
                    {user ? (
                        <p onClick={logout} style={{cursor:"pointer"}}>Logout</p>
                    ) : (
                        <>
                        <Link href={LOGIN_ROUTE}>Login</Link>
                        <Link href={REGISTER_ROUTE}>Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
})
Header.displayName = 'Header';