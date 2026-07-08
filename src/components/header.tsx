import { memo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUserContext } from "@/userContext";
import { API_LOGOUT_ROUTE, API_RESTORE_SESSION_ROUTE } from "@/constants/api.route.const";
import { ADMIN_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MYLIST_ROUTE, REGISTER_ROUTE, SEARCH_ROUTE, PROFILE_BASE_ROUTE, USER_LIST_ROUTE, WAITLIST_ROUTE } from "@/constants/app.route.const";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminKey } from "./svg/key.svg";
import { ProfilCircle } from "./svg/profil.svg";
import { Logout } from "./svg/logout.svg";
import { SwitchManga, SwitchSerie } from "./svg/switchMode.svg";

export type MenuList = "search" | "login" | "register" | "myList" | "userProfil" | "home" | "waitList" | "";

export type HeaderProps = {
    selected_menu: MenuList;
}

export const Header = memo(({ selected_menu }: HeaderProps) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user, setAlert, setUserCookie, mangaMode, setMangaMode } = useUserContext();

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

    const startAnimation = () => {
        const el = document.body;
        el.classList.add("flip-out");

        setTimeout(() => {
            el.classList.remove("flip-out");
            el.classList.add("flip-in");
            setTimeout(() => {
                el.classList.remove("flip-in");
            }, 800);
        }, 800);
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

    useEffect(() => {
        if (mangaMode) document.documentElement.classList.toggle('manga-mode', mangaMode);
    }, []);

    return (
        <div className="header-container">
            <div className="header-content">
                <div className="header-items">
                    <Link href={HOME_ROUTE}>
                        <Image unoptimized className="header-logo" src="/assets/images/logo.png" alt="logo" width={60} height={60} />
                    </Link>
                </div>
                <div className="header-items">
                    <Link href={SEARCH_ROUTE} className={selected_menu === "search" ? "selected" : ""}>Search</Link>
                    {user && (
                        <>
                            <Link href={WAITLIST_ROUTE} className={selected_menu === "waitList" ? "selected" : ""}>Wait List</Link>
                            <Link href={MYLIST_ROUTE} className={selected_menu === "myList" ? "selected" : ""}>My list</Link>
                        </>
                    )}
                </div>
                <div className="header-items">
                    {user ? (
                        <>
                            <div className="profile-menu" onClick={toggleDropdown} ref={dropdownRef}>
                                <ProfilCircle width={30} height={30} isHeader={true} className={selected_menu === "userProfil" ? "selected" : ""} />
                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-item">
                                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                {mangaMode ? <SwitchSerie width={30} height={30} /> : <SwitchManga width={30} height={30} />}
                                                <p onClick={() => {
                                                    startAnimation(); setMangaMode(prev => { const next = !prev; document.cookie = `mangaMode=${next ? "true" : "false"}; path=/; max-age=31536000`; document.documentElement.classList.toggle("manga-mode", next); return next; });
                                                }}>{mangaMode ? "Série" : "Manga"} List</p>
                                            </div>
                                        </div>
                                        <div className="dropdown-item">
                                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <ProfilCircle width={30} height={30} isHeader={false} />
                                                <Link href={PROFILE_BASE_ROUTE + "/" + user.login} onClick={() => setDropdownOpen(false)}>Profil</Link>
                                            </div>
                                        </div>
                                        <div className="dropdown-item">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Logout width={30} height={30} />
                                                <p onClick={() => { logout(); setDropdownOpen(false); }} style={{ cursor: "pointer" }}>Déconnexion</p>
                                            </div>
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
                            <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem', cursor: 'pointer' }}>
                                {mangaMode ? <SwitchSerie width={30} height={30} /> : <SwitchManga width={30} height={30} />}
                                <p style={{ color: "var(--header-footer-text)" }} onClick={() => {
                                    startAnimation(); setMangaMode(prev => { const next = !prev; document.cookie = `mangaMode=${next ? "true" : "false"}; path=/; max-age=31536000`; document.documentElement.classList.toggle("manga-mode", next); return next; });
                                }}>{mangaMode ? "Série" : "Manga"} List</p>
                            </div>
                            <Link href={LOGIN_ROUTE} className={selected_menu === "login" ? "selected" : ""}>Login</Link>
                            <Link href={REGISTER_ROUTE} className={selected_menu === "register" ? "selected" : ""}>Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
});
Header.displayName = 'Header';
