"use client"
import { EyeOff, EyeOn } from "@/components/svg/eyes.svg";
import { API_LOGIN_ROUTE } from "@/constants/api.route.const";
import { REGISTER_ROUTE } from "@/constants/app.route.const";
import { LoginResponse } from "@/types/api/auth/auth.type";
import { useUserContext } from "@/userContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Login() {

    /**
     * React hook pour permettre la navigation entre les différents endpoints de l'application web.
     */
    const router = useRouter();

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const { setUserCookie, setAlert } = useUserContext();

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const [showPassword, setShowPassword] = useState(false);

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
            setUserCookie(response.cookie);
            router.push(response.redirect);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <div className="login-container">
                <h1>Login</h1>
                <form onSubmit={formSubmit}>
                    <label htmlFor="login" className="login-label">Login:</label>
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
                <p className="login-route-change">Not registered? <Link href={REGISTER_ROUTE} style={{ color: "blue" }}>Create an account</Link></p>
            </div>
        </div>
    );
}
