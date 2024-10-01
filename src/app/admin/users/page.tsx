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
     * Récupération des informations de l'utilisateur connecté.
     */
    const { user, setAlert, setUserCookie } = useUserContext();
    
    /**
     * React hook pour permettre la navigation entre les différents endpoints de l'application web.
     */
    const router = useRouter();

    /**
     * Hook qui permet de stocker les utilisateurs récupérés depuis l'API.
     */
    const [users, setUsers] = useState<User[]>([]);

    /**
     * Hook qui permet de stocker le critère de tri des utilisateurs.
     */
    const [sortBy, setSortBy] = useState<'createdAt' | 'last_activity' | 'connected' | 'verified'>('createdAt');

    /**
     * Hook qui permet de stocker l'ordre de tri des utilisateurs.
     */
    const [orderAsc, setOrderAsc] = useState<boolean>(true);

    /**
     * Fonction qui permet de récupérer la liste des utilisateurs.
     */
    const fetchUsers = async () => {
        const response = await fetch('/api/admin/user/all');
        const data = await response.json();
        setUsers(data);
    }

    /**
     * Fonction qui permet de bannir ou de débannir un utilisateur.
     * @param {User} user - L'utilisateur à bannir ou débannir.
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
            setAlert({ message: `User ${user.login} ${user.banned?"unBan":"ban"} successfully`, valid: true });
            fetchUsers();
        } else {
            setAlert({ message: `Failed to ${user.banned?"unBan":"ban"} user ${user.login}`, valid: false });
        }
    }

    /**
     * Fonction qui permet d'incarner un utilisateur.
     * @param {User} u - L'utilisateur à incarner.
     */
    const incarnUser = async (u: User) => {
        if (!user?.admin) return;
        if (user.id.toString() === u.id) {
            setAlert({ message: `You can't incarn yourself`, valid: false });
            return;
        }

        const response = await fetch('/api/admin/user/incarn', {
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
     * Fonction qui permet de changer le critère de tri des utilisateurs.
     * @param {React.ChangeEvent<HTMLSelectElement>} e - L'événement de changement de valeur du select.
     */
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as 'createdAt' | 'last_activity' | 'connected' | 'verified');
    }

    /**
     * Fonction qui permet de changer l'ordre de tri des utilisateurs.
     */
    const handleOrderChange = () => {
        setOrderAsc(prevOrder => !prevOrder);  
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const sortedUsers = [...users].sort((a, b) => {
        let aValue: number = 0, bValue: number = 0;
    
        switch (sortBy) {
            case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
            case 'last_activity':
                aValue = new Date(a.last_activity).getTime();
                bValue = new Date(b.last_activity).getTime();
                break;
            case 'connected':
                aValue = a.web_token ? 1 : 0;
                bValue = b.web_token ? 1 : 0;
                break;
            case 'verified':
                aValue = a.verifToken ? 0 : 1;
                bValue = b.verifToken ? 0 : 1;
                break;
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
                    <option value="verified">Verified Status</option>
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
                        <th className="tableHeader">Email</th>
                        <th className="tableHeader">Admin</th>
                        <th className="tableHeader">Verified</th>
                        <th className="tableHeader">Banned</th>
                        <th className="tableHeader">Connected</th>
                        <th className="tableHeader">Creation Date</th>
                        <th className="tableHeader">Last Activity</th>
                        <th className="tableHeader">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((u, index) => (
                        <tr 
                            key={index} 
                            style={{
                                backgroundColor: u.verifToken ? '#e6ffed' : 'transparent',
                            }}
                        >
                            <td className="tableCell">{u.id}</td>
                            <td className="tableCell">
                                <Link href={`${PROFILE_BASE_ROUTE}/${u.login}`} style={{ color: "var(--secondary-background-color)" }}>
                                    {u.login}
                                </Link>
                            </td>
                            <td className="tableCell"  style={{maxWidth: 'none', whiteSpace: 'normal',  wordBreak: 'break-all'  }}>
                                {u.email}
                            </td>
                            <td className="tableCell">{u.admin ? 'Yes' : 'No'}</td>
                            <td className="tableCell">{u.verifToken ? 'No' : 'Yes'}</td>
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
                                <button 
                                    onClick={() => incarnUser(u)} 
                                    className={`button button--small ${user && u.id === user.id ? "disabled-button" : ""}`}
                                >
                                    Incarn
                                </button>
                                <button 
                                    onClick={() => toggleBanUser(u)} 
                                    className={`button button--small ${user && u.id === user.id ? "disabled-button" : ""}`}
                                >
                                    {u.banned ? "UnBan" : "Ban"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
