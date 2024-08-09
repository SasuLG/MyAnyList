"use client"

import { User } from "@/bdd/model/user";
import { useUserContext } from "@/userContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/components/svg/filter.svg";
import { PROFILE_BASE_ROUTE } from "@/constants/app.route.const";

export default function ListUsers() {

    /**
     * Récupérer les informations de l'utilisateur
     */
    const { user } = useUserContext();

    /**
     * Hook qui permet de stoker la liste des utilisateurs.
     */
    const [users, setUsers] = useState<User[]>([]);

    /**
     * Hook qui permet de stoker le type de tri.
     */
    const [sortBy, setSortBy] = useState<'createdAt' | 'last_activity'>('createdAt');

    /**
     * Hook qui permet de stoker l'ordre de tri.
     */
    const [orderAsc, setOrderAsc] = useState<boolean>(true);  // true for ascending, false for descending

    /**
     * Fonction qui permet de récupérer la liste des utilisateurs.
     */
    const fetchUsers = async () => {
        const response = await fetch('/api/admin/user/all');
        const data = await response.json();
        setUsers(data);
    }

    const toggleBanUser = async (id: string) => {
        //TODO: Implement the ban functionality
        fetchUsers();
    }

    const incarnUser = async (id: string) => {
        //TODO: Implement the incarn functionality
    }
    
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as 'createdAt' | 'last_activity');
    }

    const handleOrderChange = () => {
        setOrderAsc(prevOrder => !prevOrder);  
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const sortedUsers = [...users].sort((a, b) => {
        const aDate = sortBy === 'createdAt' ? new Date(a.createdAt).getTime() : new Date(a.last_activity).getTime();
        const bDate = sortBy === 'createdAt' ? new Date(b.createdAt).getTime() : new Date(b.last_activity).getTime();
        return orderAsc ? aDate - bDate : bDate - aDate;
    });

    return (
        <div className="container">
            <h1 className="title">Users List</h1>
            <div className="filters">
                <label htmlFor="sortBy" className="filterLabel">Sort by:</label>
                <select id="sortBy" value={sortBy} onChange={handleSortChange} className="filterSelect">
                    <option value="createdAt">Creation Date</option>
                    <option value="last_activity">Last Activity</option>
                </select>
                <button onClick={handleOrderChange} className="orderButton">
                    <Order  width={30}  height={30}  orderAsc={orderAsc} />
                </button>
            </div>
            <table className="userTable">
                <thead>
                    <tr>
                        <th className="tableHeader">Login</th>
                        <th className="tableHeader">Admin</th>
                        <th className="tableHeader">Banned</th>
                        <th className="tableHeader">Creation Date</th>
                        <th className="tableHeader">Last Activity</th>
                        <th className="tableHeader">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((user, index) => (
                        <tr key={index} className="tableRow">
                            <td className="tableCell">
                                <Link href={`${PROFILE_BASE_ROUTE}/${user.login}`} style={{ color: "var(--secondary-background-color)" }}>
                                    {user.login}
                                </Link>
                            </td>
                            <td className="tableCell">{user.admin ? 'Yes' : 'No'}</td>
                            <td className="tableCell">{user.banned ? 'Yes' : 'No'}</td>
                            <td className="tableCell">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="tableCell">{new Date(user.last_activity).toLocaleDateString()}</td>
                            <td className="tableCell">
                                <button onClick={() => incarnUser(user.id.toString())} className="button">Incarn</button>
                                <button onClick={() => toggleBanUser(user.id.toString())} className="button">Ban</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
