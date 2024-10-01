"use client"
import Image from 'next/image';

export default function Custom404() {

    const numImage = Math.floor(Math.random() * 17) + 1;
    return (
        <div className="error-page" style={{height:"100%", display:"flex", justifyContent:"center", alignItems:"center", backgroundColor:"black", overflow:"hidden"}}>
            <Image unoptimized src={`/assets/images/404/error404-${numImage}.jpg`} alt="404" width={1024} height={1024} />
        </div>
    );
}
/*
"use client";
import Image from 'next/image';

export default function Custom404() {
    const numImage = Math.floor(Math.random() * 17) + 1;
    return (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "black", overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Image 
                    src={`/assets/images/404/error404-${numImage}.jpg`} 
                    alt="404" 
                    layout="fill" // Utilisez 'fill' pour que l'image remplisse le conteneur
                    objectFit="cover" // 'cover' pour que l'image couvre tout le conteneur sans déformation
                    priority={true} // Optionnel, pour charger l'image en priorité
                />
            </div>
        </div>
    );
}

*/