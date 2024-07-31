"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ABOUT_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MENTIONS_ROUTE, REGISTER_ROUTE } from "@/constants/app.route.const";

export const Footer = memo(() => {

    return (
        <div className={`footer-container`}>
            <div className="footer-content">
                <div className="footer-items1">
                    <Image src="/assets/images/_67465c45-1ba1-4185-a6cb-5ea044a148bf-removebg-preview.png" alt="logo" width={100} height={100} />
                    <h3>MyAnyList</h3>
                </div>
                <div className="footer-items">
                    <h3>Liens</h3>
                    <ul>
                        <li>
                            <Link href={LOGIN_ROUTE}>Connexion</Link>
                        </li>
                        <li>
                            <Link href={REGISTER_ROUTE}>Inscription</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-items">
                    <h3>Navigation</h3>
                    <ul>
                        <li>
                            <Link href={HOME_ROUTE}>Accueil</Link>
                        </li>
                        <li>
                            <Link href={ABOUT_ROUTE}>À propos</Link>
                        </li>
                        <li>
                            <Link href={MENTIONS_ROUTE}>Mention légales</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
});

Footer.displayName = 'Footer';
