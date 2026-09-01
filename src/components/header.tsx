import { memo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUserContext } from "@/userContext";
import { API_LOGOUT_ROUTE, API_RESTORE_SESSION_ROUTE } from "@/constants/api.route.const";
import { ADMIN_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MYLIST_ROUTE, REGISTER_ROUTE, SEARCH_ROUTE, PROFILE_BASE_ROUTE, USER_LIST_ROUTE, WAITLIST_ROUTE, BASE_DETAILS_MANGA_ROUTE, BASE_DETAILS_SERIE_ROUTE } from "@/constants/app.route.const";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminKey } from "./svg/key.svg";
import { ProfilCircle } from "./svg/profil.svg";
import { Logout } from "./svg/logout.svg";
import { SwitchManga, SwitchSerie } from "./svg/switchMode.svg";
import { CatalogItem } from "@/types/catalog-item.type";
import { getCatalogPosterSrc } from "@/lib/catalog-item";


const SearchIcon = ({ width = 20, height = 20, className = "" }: { width?: number; height?: number; className?: string }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);
export type MenuList = "search" | "login" | "register" | "myList" | "userProfil" | "home" | "waitList" | "";

export type HeaderProps = {
    selected_menu: MenuList;
}

export const Header = memo(({ selected_menu }: HeaderProps) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user, setAlert, setUserCookie, mangaMode, setMangaMode } = useUserContext();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

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
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsLoadingSearch(false);
            return;
        }

        setIsLoadingSearch(true);

        const timer = setTimeout(async () => {
            try {
                const modeParam = mangaMode ? "mangas" : "series";
                // Modifiez l'URL selon votre API (ex: /api/mangas/search?q=... ou /api/search?q=...)
                // const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&mode=${modeParam}`);
                const response = await fetch(`/api/${encodeURIComponent("series")}/all?limit=5&page=1`)

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error("Erreur lors de la recherche rapide:", error);
            } finally {
                setIsLoadingSearch(false);
            }
        }, 200); // 200ms de délai sans écriture

        return () => clearTimeout(timer);
    }, [searchQuery, mangaMode]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (mangaMode) document.documentElement.classList.toggle('manga-mode', mangaMode);
    }, []);

    const detailRoute = mangaMode ? BASE_DETAILS_MANGA_ROUTE : BASE_DETAILS_SERIE_ROUTE;

    return (
        <div className="header-container">
            <div className="header-content">
                <div className="header-items">
                    <Link href={HOME_ROUTE}>
                        <Image unoptimized className="header-logo" src="/assets/images/logo.png" alt="logo" width={60} height={60} />
                    </Link>
                </div>
                <div className="header-items">
                    {/* Rercherce */}
                    <div className="quick-search-wrapper" ref={searchContainerRef}>
                        <button
                            className="search-toggle-btn"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            title="Rechercher"
                        >
                            <SearchIcon width={22} height={22} />
                        </button>

                        {isSearchOpen && (
                            <div className="quick-search-dropdown">
                                <div className="quick-search-input-container">
                                    <SearchIcon width={18} height={18} className="search-input-icon" />
                                    <input
                                        type="text"
                                        placeholder={`Rechercher un ${mangaMode ? 'manga' : 'série'}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="quick-search-input"
                                    />
                                    <button
                                        className="quick-search-esc"
                                        onClick={() => setIsSearchOpen(false)}
                                    >
                                        Échap
                                    </button>
                                </div>

                                {/* LISTE DES RÉSULTATS */}
                                {searchQuery.trim() !== "" && (
                                    <div className="quick-search-results">
                                        <div className="quick-search-category-title">
                                            {mangaMode ? "MANGAS" : "SÉRIES"}
                                        </div>

                                        {isLoadingSearch ? (
                                            <div className="quick-search-loading">Recherche en cours...</div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`${detailRoute}/${item.id}`}
                                                    className="quick-search-item"
                                                    onClick={() => setIsSearchOpen(false)}
                                                >
                                                    <div className="quick-search-item-poster">
                                                        {item.poster_path ? (
                                                            <img
                                                                src={getCatalogPosterSrc(item.poster_path, mangaMode ? 'mangas' : 'series')}
                                                                alt={item.name}
                                                            />
                                                        ) : (
                                                            <div className="poster-placeholder" />
                                                        )}
                                                    </div>

                                                    <div className="quick-search-item-details">
                                                        <span className="quick-search-item-title">{item.name}</span>
                                                        <span className="quick-search-item-meta">
                                                            {item.genres && item.genres.length > 0
                                                                ? item.genres.map(g => g.name).slice(0, 2).join(' · ')
                                                                : item.media_type || (mangaMode ? 'Manga' : 'Série')}
                                                        </span>
                                                    </div>

                                                    {(item.vote_average !== undefined || item.note !== undefined) && (
                                                        <div className="quick-search-item-rating">
                                                            <span>✦</span>
                                                            <span>{(item.note ?? item.vote_average ?? 0).toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="quick-search-no-results">Aucun résultat trouvé</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
