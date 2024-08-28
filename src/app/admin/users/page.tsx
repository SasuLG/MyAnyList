"use client";

import { User } from "@/bdd/model/user";
import { useUserContext } from "@/userContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/components/svg/filter.svg";
import { PROFILE_BASE_ROUTE } from "@/constants/app.route.const";
import { useRouter } from "next/navigation";

export default function ListUsers() {
    
    /**
     * Récupérer les informations de l'utilisateur
     */
    const { user, setAlert, setUserCookie } = useUserContext();

    /**
     * Récupérer le router de la page
     */
    const router = useRouter();

    /**
     * Hook qui permet de stoker la liste des utilisateurs.
     */
    const [users, setUsers] = useState<User[]>([]);

    /**
     * Hook qui permet de stoker le type de tri.
     */
    const [sortBy, setSortBy] = useState<'createdAt' | 'last_activity' | 'connected'>('createdAt');

    /**
     * Hook qui permet de stoker l'ordre de tri.
     */
    const [orderAsc, setOrderAsc] = useState<boolean>(true); // true for ascending, false for descending

    /**
     * Fonction qui permet de récupérer la liste des utilisateurs.
     */
    const fetchUsers = async () => {
        const response = await fetch('/api/admin/user/all');
        const data = await response.json();
        setUsers(data);
    }

    /**
     * Fonction qui permet de bannir ou débannir un utilisateur.
     * @param {user} user 
     */
    const toggleBanUser = async (user: User) => {
        const response = await fetch('/api/user/edit/ban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id, isBanned: user.banned }),
        });
        const data = await response.json();
        if (data.valid) {
            setAlert({ message: `User ${user.login} toggleBan successfully`, valid: true });
            fetchUsers();
        } else {
            setAlert({ message: `Failed to update user ${user.login} toggleBan`, valid: false });
        }
    }

    /**
     * Fonction qui permet d'incarner un utilisateur.
     * @param {user} u 
     */
    const incarnUser = async (u: User) => {
        if (!user?.admin) return;
        if (user.id.toString() === u.id) {
            setAlert({ message: `You can't incarn yourself`, valid: false });
            return;
        }

        const response = await fetch(`/api/admin/user/incarn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ incarnId: u.id }),
        });
        const data = await response.json();
        setAlert(data);
        if (response.ok) {
            setUserCookie("");
            router.push(PROFILE_BASE_ROUTE + '/' + u.login);
        }
    }

    /**
     * Fonction qui permet de changer le type de tri.
     * @param {React.ChangeEvent<HTMLSelectElement>} e 
     */
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as 'createdAt' | 'last_activity' | 'connected');
    }

    /**
     * Fonction qui permet de changer l'ordre de tri.
     */
    const handleOrderChange = () => {
        setOrderAsc(prevOrder => !prevOrder);  
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    // Sort users based on the selected criteria
    const sortedUsers = [...users].sort((a, b) => {
        let aValue: number = 0, bValue: number = 0; // Initialize with default values
    
        if (sortBy === 'createdAt') {
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        } else if (sortBy === 'last_activity') {
            aValue = new Date(a.last_activity).getTime();
            bValue = new Date(b.last_activity).getTime();
        } else if (sortBy === 'connected') {
            aValue = a.web_token ? 1 : 0;
            bValue = b.web_token ? 1 : 0;
        }
    
        return orderAsc ? aValue - bValue : bValue - aValue;
    });

    return (
        <div className="container">
            <h1 className="title">Users List</h1>
            <div className="filters">
                <label htmlFor="sortBy" className="filterLabel">Sort by:</label>
                <select id="sortBy" value={sortBy} onChange={handleSortChange} className="filterSelect">
                    <option value="createdAt">Creation Date</option>
                    <option value="last_activity">Last Activity</option>
                    <option value="connected">Connected Status</option>
                </select>
                <button onClick={handleOrderChange} className="orderButton">
                    <Order width={30} height={30} orderAsc={orderAsc} />
                </button>
            </div>
            <table className="userTable">
                <thead>
                    <tr>
                        <th className="tableHeader">ID</th>
                        <th className="tableHeader">Login</th>
                        <th className="tableHeader">Admin</th>
                        <th className="tableHeader">Banned</th>
                        <th className="tableHeader">Connected</th>
                        <th className="tableHeader">Creation Date</th>
                        <th className="tableHeader">Last Activity</th>
                        <th className="tableHeader">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((u, index) => (
                        <tr key={index} className="tableRow">
                            <td className="tableCell">{u.id}</td>
                            <td className="tableCell">
                                <Link href={`${PROFILE_BASE_ROUTE}/${u.login}`} style={{ color: "var(--secondary-background-color)" }}>
                                    {u.login}
                                </Link>
                            </td>
                            <td className="tableCell">{u.admin ? 'Yes' : 'No'}</td>
                            <td className="tableCell">{u.banned ? 'Yes' : 'No'}</td>
                            <td className="tableCell">
                                <span
                                    className={`status-indicator ${u.web_token ? 'online' : 'offline'}`}
                                    title={u.web_token ? 'Online' : 'Offline'}
                                />
                            </td>
                            <td className="tableCell">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="tableCell">{new Date(u.last_activity).toLocaleDateString()}</td>
                            <td className="tableCell">
                                <button onClick={() => incarnUser(u)} className={`button button--small ${user && u.id === user.id ? "disabled-button" : ""}`}>Incarn</button>
                                <button onClick={() => toggleBanUser(u)} className={`button button--small ${user && u.id === user.id ? "disabled-button" : ""}`}>{u.banned ? "UnBan" : "Ban"}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
