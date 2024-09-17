"use client"
import { EyeOff, EyeOn } from "@/components/svg/eyes.svg";
import { API_LOGIN_ROUTE } from "@/constants/api.route.const";
import { REGISTER_ROUTE } from "@/constants/app.route.const";
import { LoginResponse } from "@/types/api/auth/auth.type";
import { useUserContext } from "@/userContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function Login() {

    /**
     * React hook pour permettre la navigation entre les différents endpoints de l'application web.
     */
    const router = useRouter();

    const searchParams = useSearchParams();
    const verifToken = searchParams.get('verifToken') ?? "";
    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const { setUserCookie, setAlert, setSelectedMenu } = useUserContext();

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Hook qui permet de gérer le décompte du temps avant de pouvoir cliquer sur le lien de connexion.
     */
    const [countdown, setCountdown] = useState(30); 

    /**
     * Hook qui permet de gérer l'état cliquable du lien de connexion.
     */
    const [isClickable, setIsClickable] = useState(false); 

    /**
     * Hook qui permet de gérer l'affichage du popup pour renvoyer le mail.
     */
    const [showPopup, setShowPopup] = useState(false);

    /**
     * Fonction qui permet de soumettre le formulaire de connexion.
     * @param e - L'événement de soumission du formulaire.
     */
    const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const loginInput = (e.currentTarget.elements.namedItem('login') as HTMLInputElement);
        const passwordInput = (e.currentTarget.elements.namedItem('password') as HTMLInputElement);

        const response = await fetch(API_LOGIN_ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: loginInput.value,
                password: passwordInput.value
            })
        }).then(async (res) => await res.json() as LoginResponse);

        setAlert(response);
        if(response.valid){
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: loginInput.value }),
              });
            setUserCookie(response.cookie);
            router.push(response.redirect);
        }
    };

    /**
     * Fonction qui permet de gérer le clic sur le lien de renvoi de l'email de confirmation.
     */
    const handleClick = () => {
        if(verifToken){
            fetch('/api/user/auth/verifToken/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ verifToken: verifToken })
            }).then(async (res) => {
                const response = await res.json();
                setAlert(response);
            });
        }
    };

    /**
     * Effet pour gérer le décompte de 30 secondes.
     */
    useEffect(() => {
        if (verifToken) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown === 1) {
                        clearInterval(timer);
                        setIsClickable(true); 
                    }
                    return prevCountdown - 1;
                });
            }, 2000); 
        }
    }, [verifToken, setSelectedMenu]);

    useEffect(() => setSelectedMenu("login"), [setSelectedMenu]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="login-container">
                <h1>Login</h1>

                <form onSubmit={formSubmit}>
                    <label htmlFor="login" className="login-label">Login ou email:</label>
                    <input type="text" id="login" name="login" />

                    <label htmlFor="password" className="login-label">Password:</label>
                    <div className="password-container">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="password" 
                            name="password" 
                        />
                        <span 
                            className="toggle-password" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff width={25} height={15}/> : <EyeOn width={25} height={15}/>}
                        </span>
                    </div>
                    
                    <button type="submit" className="login-button">Login</button>
                </form>

                {verifToken && (
                    <div style={{ marginBottom: "10px", fontSize: "14px", marginTop:"5px" }}>
                        <p style={{ color: "#666", marginBottom: "5px" }}>Message de confirmation envoyé</p>
                        {!isClickable ? (
                            <p style={{ color: "#999", fontSize: "12px" }}>Vous pourrez renvoyer l'email dans {countdown} secondes...</p>
                        ) : (
                            <p 
                                style={{ color: '#007BFF', cursor: 'pointer', fontSize: "12px", textDecoration: "underline" }} 
                                onClick={handleClick}
                            >
                                Cliquez ici pour renvoyer l'email de confirmation
                            </p>
                        )}
                    </div>
                )}

                <p className="login-route-change">Not registered? <Link href={REGISTER_ROUTE} style={{ color: "blue" }}>Create an account</Link></p>
            </div>
        </div>
    );
}
