"use client"
import { API_REGISTER_ROUTE } from "@/constants/api.route.const";
import { HashWord } from "@/lib/hash";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { EyeOff, EyeOn } from "@/components/svg/eyes.svg";
import { LOGIN_ROUTE } from "@/constants/app.route.const";
import { useRouter } from "next/navigation";

export default function Register() {

    /**
     * React hook pour permettre la navigation entre les différents endpoints de l'application web.
     */
    const router = useRouter();

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Hook qui permet de gérer l'affichage de la confirmation du mot de passe.
     */
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Fonction qui permet de soumettre le formulaire d'inscription.
     * @param e - L'événement de soumission du formulaire.
     */
    const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const loginInput = (e.currentTarget.elements.namedItem('login') as HTMLInputElement);
        const passwordInput = (e.currentTarget.elements.namedItem('password') as HTMLInputElement);
        const confirmPasswordInput = (e.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement);

        if (loginInput.value.trim() === '' || passwordInput.value.trim() === '' || confirmPasswordInput.value.trim() === '') { return; }
        if (passwordInput.value !== confirmPasswordInput.value) { return; }
        if(loginInput.value.length < 3) { return; }

        const response = await fetch(API_REGISTER_ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: loginInput.value,
                password: await HashWord(passwordInput.value),
                admin: false,
                banned: false
            })
        });
        router.push(LOGIN_ROUTE);
        //TODO setalert
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="login-container">
                <h1>Register</h1>
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

                    <label htmlFor="confirmPassword" className="login-label">Confirm Password:</label>
                    <div className="password-container">
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            id="confirmPassword" 
                            name="confirmPassword" 
                        />
                        <span 
                            className="toggle-password" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff width={25} height={15}/> : <EyeOn width={25} height={15}/>}
                        </span>
                    </div>

                    <button type="submit" className="login-button">Register</button>
                </form>
                <p className="login-route-change">Already registered? <Link href={LOGIN_ROUTE} style={{ color: "blue" }}>Login here</Link></p>
            </div>
        </div>
    );
}
