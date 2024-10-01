
"use client"
import { HashWord } from "@/lib/hash";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { EyeOff, EyeOn } from "@/components/svg/eyes.svg";
import { LOGIN_ROUTE } from "@/constants/app.route.const";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserContext } from "@/userContext";

const ResetMdpForm = () => {

    const searchParams = useSearchParams();
    const resetToken = searchParams.get('token') ?? "";

    /**
     * React hook pour permettre la navigation entre les différents endpoints de l'application web.
     */
    const router = useRouter();

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const { setAlert, setSelectedMenu } = useUserContext();

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Hook qui permet de gérer l'affichage de la confirmation du mot de passe.
     */
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Fonction qui permet de soumettre le formulaire de reset mdp.
     * @param e - L'événement de soumission du formulaire.
     */
    const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const passwordInput = (e.currentTarget.elements.namedItem('password') as HTMLInputElement);
        const confirmPasswordInput = (e.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement);

        if (passwordInput.value !== confirmPasswordInput.value) { 
            setAlert({message:"Le mot de passe doit être identique", valid:false});
            return; 
        }
        if (passwordInput.value.length < 3) { 
            setAlert({message:"Mot de passe trop court", valid:false});
            return; 
        }

        const userRequest = await fetch(`/api/user/auth/resetToken?resetToken=${encodeURIComponent(resetToken)}`);
        const user = await userRequest.json();
        if(!user) router.push(`${LOGIN_ROUTE}`);
        const response = await fetch(`/api/user/edit/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id, newPassword: await HashWord(passwordInput.value) })
        });

        const data = await response.json();
        setAlert(data);
        if (response.ok) {
            const response = await fetch(`/api/user/auth/resetToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ verifToken: user.verifToken })
            });
            if(response.status === 200) return router.push(`${LOGIN_ROUTE}`);
        }
    }

    useEffect(() => setSelectedMenu(""), [setSelectedMenu]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "130vh" }}>
            <div className="login-container">
                <h1>Reset password</h1>
                <form onSubmit={formSubmit}>

                    <label htmlFor="password" className="login-label">New Password:</label>
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

                    <button type="submit" className="login-button">Reset password</button>
                </form>
            </div>
        </div>
    );
}

const ResetMdpPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetMdpForm />
        </Suspense>
    );
};

export default ResetMdpPage;