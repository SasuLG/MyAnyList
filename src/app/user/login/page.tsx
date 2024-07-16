"use client"
import { LoginResponse } from "@/types/api/auth/auth.type";
import { useUserContext } from "@/userContext";
import { FormEvent } from "react";

export default function login(){

    /**
     * Variable qui permet d'accéder au context de l'application.
     */
    const { setUserCookie } = useUserContext();

    const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //const response = await fetch("/api/user/auth/log", { method: 'PUT' });
        const loginInput = (e.currentTarget.elements.namedItem('login') as HTMLInputElement);
        const passwordInput = (e.currentTarget.elements.namedItem('password') as HTMLInputElement);

        const response = await fetch('/api/user/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: loginInput.value,
                password: passwordInput.value
            })
        }).then(async (res) => await res.json() as LoginResponse)

        if(response.valid){
            setUserCookie(response.cookie);
            console.log('Connexion réussi !');
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={formSubmit}>
                <label htmlFor="login">login:</label>
                <input type="text" id="login" name="login" />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" />

                <button type="submit">Login</button>
            </form>
        </div>
    )
}