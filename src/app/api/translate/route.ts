import { ServerError } from "@/lib/api/response/server.response";
import { toRomaji } from "wanakana";
import path from 'path';

// Importation dynamique de kuromoji
const kuromoji = require('kuromoji');

export async function POST(req: Request): Promise<Response> {
    try {
        
        // Assure-toi que le corps de la requête est en JSON
        const requestBody = await req.json();
        const texts: string[] = requestBody.texts;

        // Validation des entrées
        if (!Array.isArray(texts) || texts.some(text => typeof text !== 'string')) {
            return new Response(JSON.stringify({ error: "Invalid input format" }), { status: 400 });
        }

        // Initialisation du tokenizer
        let dictPath = 'node_modules/kuromoji/dict';
        if(process.env.MODE === 'production') dictPath = path.resolve(process.cwd(), 'public/kuromoji-dict');
        const tokenizerPromise = new Promise<any>((resolve, reject) => {
            kuromoji.builder({ dicPath: dictPath }).build((err: any, tokenizer: any) => {
                if (err) reject(err);
                else resolve(tokenizer);
            });
        });

        const tokenizer = await tokenizerPromise;
        // Fonction pour translittérer un texte en romaji
        const transliterateText = (text: string): string => {
            const tokens = tokenizer.tokenize(text);

            let romajiText = '';
            let currentRomajiToken = '';
            let lastWasJapanese = false;

            tokens.forEach((token: any) => {
                const isJapanese = /[\u3040-\u30FF\u4E00-\u9FAF]/.test(token.surface_form);
                const tokenText = token.reading ? toRomaji(token.reading) : token.surface_form;

                if (isJapanese) {
                    if (currentRomajiToken) {
                        romajiText += currentRomajiToken.trim() + ' ';
                        currentRomajiToken = '';
                    }
                    romajiText += tokenText + ' ';
                    lastWasJapanese = true;
                } else {
                    if (lastWasJapanese && romajiText.length > 0) {
                        romajiText += ' ';
                    }
                    currentRomajiToken += tokenText;
                    lastWasJapanese = false;
                }
            });
            // Ajouter le dernier token romaji s'il y en a
            if (currentRomajiToken) {
                romajiText += currentRomajiToken.trim();
            }

            // Supprimer les espaces supplémentaires à la fin
            romajiText = romajiText.trim();

            // Éviter les espaces avant la ponctuation
            romajiText = romajiText.replace(/ \s*([,!?-])/g, '$1');

            // Capitaliser les mots correctement
            romajiText = romajiText
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            return romajiText;
        };

        // Translittérer chaque texte dans le tableau
        const romajiTexts = texts.map(text => transliterateText(text));

        return new Response(JSON.stringify({ texts: romajiTexts }), { status: 200 });
    } catch (err) {
        return ServerError('/api/user/', err);
    }
}
