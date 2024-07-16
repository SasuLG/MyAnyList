"use client"
import { HashWord } from "@/lib/hash";
import { FormEvent } from "react";

export default function register(){

    const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const loginInput = (e.currentTarget.elements.namedItem('login') as HTMLInputElement);
        const passwordInput = (e.currentTarget.elements.namedItem('password') as HTMLInputElement);
        const confirmPasswordInput = (e.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement);

        if (loginInput.value.trim() === '' || passwordInput.value.trim() === '') { return; }
        if (passwordInput.value !== confirmPasswordInput.value) { return; }
        if(loginInput.value.length < 3) { return; }
        console.log(loginInput, passwordInput);
        const response = await fetch('/api/user/auth/register', {
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

    }

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={formSubmit}>
                <label htmlFor="login">login:</label>
                <input type="text" id="login" name="login" />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" />

                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" />

                <button type="submit">Register</button>
            </form>
        </div>
    )
}