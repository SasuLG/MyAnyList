import { memo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUserContext } from "@/userContext";
import { API_LOGOUT_ROUTE, API_RESTORE_SESSION_ROUTE } from "@/constants/api.route.const";
import { ADMIN_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MYLIST_ROUTE, REGISTER_ROUTE, SEARCH_ROUTE, PROFILE_BASE_ROUTE, USER_LIST_ROUTE } from "@/constants/app.route.const";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminKey } from "./svg/key.svg";
import { ProfilCircle } from "./svg/profil.svg";
import { Logout } from "./svg/logout.svg";

export type MenuList = "search" | "login" | "register" | "myList" | "userProfil" | "home" |  "";

export type HeaderProps = {
    selected_menu: MenuList;
}

export const Header = memo(({ selected_menu }: HeaderProps) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user, updateUserInfo, setAlert, setUserCookie } = useUserContext();

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    const logout = async () => {
        const response = await fetch(API_LOGOUT_ROUTE, { method: 'PUT' });
        const data = await response.json();
        setAlert(data);

        if (response.ok) {
            setUserCookie("");
            router.push(LOGIN_ROUTE);
        }
        return data;
    };

    const restorePreviousSession = async () => {
        const response = await fetch(API_RESTORE_SESSION_ROUTE, { method: 'POST' });
        const data = await response.json();
        setAlert(data);

        if (response.ok) {
            setUserCookie("");
            router.push(USER_LIST_ROUTE);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="header-container">
            <div className="header-content">
                <div className="header-items">
                    <Link href={HOME_ROUTE}>
                        <Image unoptimized src="/assets/images/_73117bf0-c91e-4bb6-85f0-64563fc48a5c-removebg-preview.png" alt="logo" width={60} height={60} />
                    </Link>
                </div>
                <div className="header-items">
                    <Link href={SEARCH_ROUTE} className={selected_menu === "search" ? "selected" : ""}>Search</Link>
                    {user && (
                        <Link href={MYLIST_ROUTE} className={selected_menu === "myList" ? "selected" : ""}>My list</Link>
                    )}
                </div>
                <div className="header-items">
                    {user ? (
                        <>
                            <div className="profile-menu" onClick={toggleDropdown} ref={dropdownRef}>
                                <ProfilCircle width={30} height={30} isHeader={true} className={selected_menu === "userProfil" ? "selected" : ""}/>
                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div>
                                            <ProfilCircle width={30} height={30} isHeader={false} />
                                            <Link href={PROFILE_BASE_ROUTE + "/"+user.login} onClick={() => setDropdownOpen(false)}>Profil</Link>
                                        </div>
                                        <div>
                                            <Logout width={30} height={30} />
                                            <p onClick={() => { logout(); setDropdownOpen(false); }} style={{ cursor: "pointer" }}>Déconnexion</p>
                                        </div>
                                        {user.admin && (
                                            <>
                                                <div>
                                                    <Link href={ADMIN_ROUTE}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <AdminKey width={30} height={30} />
                                                            <p>Admin</p>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                        {user.isIncarned && (
                                            <div>
                                                <p onClick={restorePreviousSession} style={{ cursor: "pointer", color: "blue" }}>
                                                    UnIncarn
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href={LOGIN_ROUTE} className={selected_menu === "login" ? "selected" : ""}>Login</Link>
                            <Link href={REGISTER_ROUTE} className={selected_menu === "register" ? "selected" : ""}>Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});
Header.displayName = 'Header';
