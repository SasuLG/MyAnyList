"use client"
import { memo } from "react";
import Image from "next/image";
import { useUserContext } from "@/userContext";
import { API_LOGOUT_ROUTE } from "@/constants/api.route.const";
import { ADMIN_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MYLIST_ROUTE, REGISTER_ROUTE, SEARCH_ROUTE } from "@/constants/app.route.const";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminKey } from "./svg/key.svg";

export type MenuList = "search" | "login" | "register" | "myList" | "admin" | "userProfil" | "";

export type HeaderProps = {
    selected_menu: MenuList;
}

export const Header = memo((selected_menu : HeaderProps)=>{

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
                    <Link href={SEARCH_ROUTE} className={selected_menu.selected_menu === "search" ? "selected" : undefined}>Search</Link>
                    {user && (
                        <Link href={MYLIST_ROUTE} className={selected_menu.selected_menu === "myList" ? "selected" : undefined}>My list</Link>
                    )}
                </div>
                <div className="header-items">
                    {user ? (//TODO profil
                        <>
                        <p onClick={logout} style={{cursor:"pointer"}}>Logout</p>
                        {user.admin && (
                            <Link href={ADMIN_ROUTE} className={selected_menu.selected_menu === "admin" ? "selected" : undefined}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <AdminKey width={20} height={20} />
                                    Admin
                                </span>
                            </Link>
                        )}
                        </>
                    ) : (
                        <>
                        <Link href={LOGIN_ROUTE} className={selected_menu.selected_menu === "login" ? "selected" : undefined}>Login</Link>
                        <Link href={REGISTER_ROUTE} className={selected_menu.selected_menu === "register" ? "selected" : undefined}>Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
})
Header.displayName = 'Header';