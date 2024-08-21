"use client"

import { IMPORT_ROUTE, USER_LIST_ROUTE } from "@/constants/app.route.const";
import { useUserContext } from "@/userContext";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminPage() {

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const { setSelectedMenu } = useUserContext();
    
    useEffect(() => setSelectedMenu(""), [setSelectedMenu]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: 'var(--background-color)', color: 'var(--secondary-text-color)', fontFamily: 'Arial, sans-serif', minHeight: '100vh', transition: 'background-color 0.3s, color 0.3s' }}>
            <h1 style={{ color: 'var(--titre-color)', marginBottom: '30px' }}>Admin Page</h1>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px', gap: '0.5rem' }}>
                <div style={{ marginBottom: '20px', width: '100%' }}>
                    <Link href={USER_LIST_ROUTE} style={{ display: 'block', textAlign: 'center', padding: '15px', backgroundColor: 'var(--background-color)', color: 'var(--main-text-color)', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)', transition: 'background-color 0.3s, color 0.3s, transform 0.3s', fontSize: '18px' }} 
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--button-color)'; e.currentTarget.style.color = 'var(--secondary-text-color)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--background-color)'; e.currentTarget.style.color = 'var(--main-text-color)'; }}>
                        Liste des utilisateurs
                    </Link>
                </div>
                <div style={{ marginBottom: '20px', width: '100%' }}>
                    <Link href={IMPORT_ROUTE} style={{ display: 'block', textAlign: 'center', padding: '15px', backgroundColor: 'var(--background-color)', color: 'var(--main-text-color)', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)', transition: 'background-color 0.3s, color 0.3s, transform 0.3s', fontSize: '18px' }} 
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--button-color)'; e.currentTarget.style.color = 'var(--secondary-text-color)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--background-color)'; e.currentTarget.style.color = 'var(--main-text-color)'; }}>
                        Import Séries
                    </Link>
                </div>
                <div style={{ marginBottom: '20px', width: '100%' }}>
                    <Link href="" style={{ display: 'block', textAlign: 'center', padding: '15px', backgroundColor: 'var(--background-color)', color: 'var(--main-text-color)', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)', transition: 'background-color 0.3s, color 0.3s, transform 0.3s', fontSize: '18px' }} 
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--button-color)'; e.currentTarget.style.color = 'var(--secondary-text-color)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--background-color)'; e.currentTarget.style.color = 'var(--main-text-color)'; }}>
                        Liste des Séries
                    </Link>
                </div>
            </div>
        </div>
    );
}
