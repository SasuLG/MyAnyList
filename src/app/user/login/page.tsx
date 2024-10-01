"use client"
import { EyeOff, EyeOn } from "@/components/svg/eyes.svg";
import { API_LOGIN_ROUTE } from "@/constants/api.route.const";
import { REGISTER_ROUTE } from "@/constants/app.route.const";
import { LoginResponse } from "@/types/api/auth/auth.type";
import { useUserContext } from "@/userContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

const LoginForm = () => {

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
     * Hook qui permet de stocker l'email de l'utilisateur pour le reset mdp.
     */
    const [email, setEmail] = useState("");

    /**
     * Hook qui permet de gérer le décompte du temps avant de pouvoir cliquer sur le lien de pour reset le mdp.
     */
    const [resetCountdown, setResetCountdown] = useState(60);

    /**
     * Hook qui permet de gérer l'état cliquable du lien de reset mdp.
     */
    const [isResetClickable, setIsResetClickable] = useState(true);

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
     * Fonction qui permet de gérer l'envoi de l'email de reset mdp.
     * @param  e - L'événement de soumission du formulaire.
     */
    const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isResetClickable) {
            const userRequest = await fetch(`/api/user/auth/mail?mail=${encodeURIComponent(email)}`);
            const user = await userRequest.json();
            if(!user){
                setAlert({ message: 'Utilisateur introuvable.', valid: false });
                return;
            }
            const res = await fetch(`/api/user/auth/resetToken/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: user })
            });
            if(res.status !== 200) {
                setAlert({ message: 'Une erreur est survenue.', valid: false });
                return;
            }
            const data = await res.json();
            const response = await fetch(`/api/user/auth/resetToken/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: data })
            });
            setIsResetClickable(false);
            setResetCountdown(60);
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

    /**
     * Effet pour gérer le décompte de 60 secondes.
     */
    useEffect(() => {
        if (!isResetClickable) {
            const timer = setInterval(() => {
                setResetCountdown((prevCountdown) => {
                    if (prevCountdown === 1) {
                        clearInterval(timer);
                        setIsResetClickable(true);
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
        }
    }, [isResetClickable]);

    useEffect(() => setSelectedMenu("login"), [setSelectedMenu]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            {showPopup && (
                <div className="overlay" style={{ position: "fixed", left: "0", top: "0", backgroundColor: "rgba(0, 0, 0, 0.5)", width: "100%", height: "100%", zIndex: "10" }}>
                    <div className="overlay-content" style={{ margin: "18% auto", padding: "3rem 5rem", borderRadius: "15px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h2>Réinitialiser le mot de passe</h2>
                            <form onSubmit={handleForgotPassword}>
                                <label htmlFor="email">Email:</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                                <button style={{backgroundColor:(!isResetClickable || email.length <= 0) ? "grey":"", cursor:(!isResetClickable || email.length <= 0)?"default":""}} className="button" type="submit" disabled={(!isResetClickable || email.length <= 0)}>Envoyer</button>
                                <button style={{backgroundColor: "#dc3545", color: "#fff",}} className="button" type="button" onClick={() => setShowPopup(false)}>Annuler</button>
                            </form>
                            {!isResetClickable && (
                                <p style={{ color: "#999", fontSize: "12px" }}>Vous pourrez renvoyer l&apos;email dans {resetCountdown} secondes...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
                            <p style={{ color: "#999", fontSize: "12px" }}>Vous pourrez renvoyer l&apos;email dans {countdown} secondes...</p>
                        ) : (
                            <p 
                                style={{ color: '#007BFF', cursor: 'pointer', fontSize: "12px", textDecoration: "underline" }} 
                                onClick={handleClick}
                            >
                                Cliquez ici pour renvoyer l&apos;email de confirmation
                            </p>
                        )}
                    </div>
                )}

                <p className="login-route-change">Not registered? <Link href={REGISTER_ROUTE} style={{ color: "blue" }}>Create an account</Link></p>
                <p className="forgot-password" style={{ color: "blue", cursor: "pointer", textAlign:"center", marginTop:"0.2rem" }} onClick={() => setShowPopup(true)}>Mot de passe oublié?</p>

            </div>
        </div>
    );
}
const LoginPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
};

export default LoginPage;