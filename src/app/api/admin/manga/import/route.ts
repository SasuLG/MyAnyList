import { getTmdbIdsMangas } from "@/bdd/requests/admin-manga.request";
import { importManga } from "@/bdd/requests/admin-manga.request";
import { ServerError } from "@/lib/api/response/server.response";
export const maxDuration = 60; // This function can run for a maximum of 10 seconds

function toSlug(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function getDernierChapitreFromManga(manga: any): Promise<number | null> {
  const candidates: string[] = [];

  if (manga.title_english) {
    candidates.push(manga.title_english);
  }

  if (Array.isArray(manga.synonyms)) {
    for (const syn of manga.synonyms) {
      if (syn?.name) {
        candidates.push(syn.name);
      }
    }
  }

  for (const name of candidates) {
    const slug = toSlug(name);
    const url = `https://scansfr.com/manga/${slug}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        cache: "no-store",
      });

      if (!response.ok) continue;

      const html = await response.text();

      const match = html.match(
        /<a[^>]*class="[^"]*\bbg-cyan-600\b[^"]*"[^>]*href="([^"]+)"/
      );

      if (!match) continue;

      const chapitre = Number(match[1].split("/").pop());

      return chapitre;
    } catch {
      continue;
    }
  }

  return null;
}
/**
 * Route : /api/admin/manga/import
 * METHOD : POST
 * 
 * Route de l'api pour insérer une nouvelle série dans la base de données.
 * 
 * @returns {Response} La réponse de la requête de modification.
 * @params {any} [token, name] - Le paramètre dynamique de la route de l'api.
 * @returns {Response} La réponse de la requête.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const mangaData = await req.json();

        if(mangaData.chapters === undefined || mangaData.chapters === null) mangaData.chapters = await getDernierChapitreFromManga(mangaData);

        await importManga(mangaData);
        return new Response(JSON.stringify({ message: 'Manga importé avec succès', valid: true }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('POST : /api/admin/series/import', err);
    }
}


/**
 * Route : /api/admin/manga/import
 * METHOD : GET
 *
 * Route de l'api pour récupérer l'id des mangas importés.
 *
 * @returns {Response} La réponse de la requête de récupération.
 * @params {any} [token, name] - Le paramètre dynamique de la route de l'api.
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const anilistIds = await getTmdbIdsMangas();
        if(!anilistIds || anilistIds.length <= 0) {
            return new Response(JSON.stringify({ message: 'Aucun manga à importer' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }
        return new Response(JSON.stringify(anilistIds), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('GET : /api/amdin/series/import', err);
    }
}