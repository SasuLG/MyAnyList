"use client"

import { LogoTmdb } from "@/components/svg/tmdb.svg";

export default function Mentions() {
    return (
        <div>
            <h1>Mentions légales</h1>
            <LogoTmdb width={100} height={100}/>
            <p>MyAnyList utilise l'api TMDB pour l'import de séries. Ce site n'est ni approuvé ni certifié par TMDB</p>

            <section>
                <h2>Informations légales</h2>
                <p><strong>Nom :</strong> Votre Nom</p>
                <p><strong>Email :</strong> votre.email@example.com</p>
            </section>

            <section>
                <h2>Responsable de la publication</h2>
                <p><strong>Nom :</strong> Votre Nom</p>
                <p><strong>Email :</strong> votre.email@example.com</p>
            </section>

            <section>
                <h2>Hébergement</h2>
                <p><strong>Nom de l'hébergeur :</strong> Hébergeur Inc.</p>
            </section>

            <section>
                <h2>Propriété intellectuelle</h2>
                <p>Le contenu du site, incluant les textes, images, vidéos, et logos, est la propriété de Votre Nom et est protégé par les lois sur la propriété intellectuelle. Toute reproduction ou distribution sans autorisation est interdite.</p>
            </section>

            <section>
                <h2>Responsabilité</h2>
                <p>Je ne saurais être tenu(e) responsable des éventuels dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le site, y compris les pertes de données, interruptions ou autres problèmes techniques.</p>
            </section>

            <section>
                <h2>Modification des mentions légales</h2>
                <p>Je me réserve le droit de modifier ces mentions légales à tout moment. Les utilisateurs sont invités à les consulter régulièrement.</p>
            </section>

            <section>
                <h2>Droit applicable</h2>
                <p>Les présentes mentions légales sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève des tribunaux compétents de Paris.</p>
            </section>

            <section>
                <h2>Liens utiles</h2>
                <p><strong>Portfolio :</strong> <a href="https://sasulg.github.io" target="_blank" rel="noopener noreferrer">sasulg.github.io</a></p>
                <p><strong>GitHub :</strong> <a href="https://github.com/SasuLG/" target="_blank" rel="noopener noreferrer">github.com/SasuLG</a></p>
            </section>
        </div>
    );
}
