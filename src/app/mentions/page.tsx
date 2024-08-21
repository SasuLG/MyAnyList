"use client";

import { LogoTmdb } from "@/components/svg/tmdb.svg";

export default function Mentions() {
    return (
        <div style={{ padding: '2rem', backgroundColor: 'var(--background-color)', fontFamily: 'Roboto, sans-serif', color: 'var(--main-text-color)', maxWidth: '800px', margin: 'auto', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--titre-color)' }}>
                Mentions légales
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <LogoTmdb width={100} height={100} />
            </div>
            <p style={{ fontSize: '1rem', margin: '1rem 0', textAlign: 'center' }}>
                MyAnyList utilise l&apos;API TMDB pour l&apos;import de séries. Ce site n&apos;est ni approuvé ni certifié par TMDB.
            </p>

            <h2 style={{ fontSize: '1.75rem', color: 'var(--titre-color)', marginBottom: '1rem', borderBottom: '2px solid var(--titre-color)', paddingBottom: '0.5rem' }}>
                Informations légales
            </h2>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                <strong>Nom :</strong> Graziani Léo
            </p>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                <strong>Email :</strong> grazianileo498@gmail.com
            </p>

            <h2 style={{ fontSize: '1.75rem', color: 'var(--titre-color)', marginBottom: '1rem', borderBottom: '2px solid var(--titre-color)', paddingBottom: '0.5rem' }}>
                Propriété intellectuelle
            </h2>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                Le contenu de ce site, incluant les textes, design, et code, est la propriété de Graziani Léo, sauf indication contraire. Les données importées via l&apos;API TMDB restent la propriété de TMDB.
            </p>

            <h2 style={{ fontSize: '1.75rem', color: 'var(--titre-color)', marginBottom: '1rem', borderBottom: '2px solid var(--titre-color)', paddingBottom: '0.5rem' }}>
                Hébergement
            </h2>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                <strong>Nom de l&apos;hébergeur :</strong> Ce site est hébergé par Vercel.
            </p>

            <h2 style={{ fontSize: '1.75rem', color: 'var(--titre-color)', marginBottom: '1rem', borderBottom: '2px solid var(--titre-color)', paddingBottom: '0.5rem' }}>
                Responsabilité
            </h2>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                Je ne saurais être tenu(e) responsable des éventuels dommages directs ou indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le site, y compris les pertes de données, interruptions ou autres problèmes techniques.
            </p>

            <h2 style={{ fontSize: '1.75rem', color: 'var(--titre-color)', marginBottom: '1rem', borderBottom: '2px solid var(--titre-color)', paddingBottom: '0.5rem' }}>
                Modification des mentions légales
            </h2>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                Je me réserve le droit de modifier ces mentions légales à tout moment. Les utilisateurs sont invités à les consulter régulièrement.
            </p>

            <h2 style={{ fontSize: '1.75rem', color: 'var(--titre-color)', marginBottom: '1rem', borderBottom: '2px solid var(--titre-color)', paddingBottom: '0.5rem' }}>
                Liens utiles
            </h2>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                <strong>Portfolio :</strong> <a href="https://sasulg.github.io" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>sasulg.github.io</a>
            </p>
            <p style={{ fontSize: '1rem', margin: '1rem 0' }}>
                <strong>GitHub :</strong> <a href="https://github.com/SasuLG/" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>github.com/SasuLG</a>
            </p>
        </div>
    );
}
