
function fetchApi(query: string, variables: {}) {
    var url = 'https://graphql.anilist.co',
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: variables
        })
      };
    return fetch(url, options).then((res) => res.json()).then((json) => { return json });
}

export async function getMangasBySearch(search: string) {
    var query = GET_MANGA_SEARCH;
    
    var variables = {
        page: 1,
        type: "MANGA",
        search: search
    };
    const response = await fetchApi(query, variables);
    return response.data.Page.media as any[];
}

export const GET_MANGA_SEARCH = `
query Page($page: Int, $type: MediaType, $search: String, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
        media(type: $type, search: $search) {
            title { romaji english native }
            id
            chapters
            volumes
            endDate { year month day }
            status
            format
            type
            startDate { year month day }
            description
            coverImage { extraLarge }
            bannerImage
            countryOfOrigin
            genres
            synonyms
            popularity
            meanScore
            averageScore
            tags { id name description category rank isAdult }
            isAdult
            recommendations { nodes { mediaRecommendation { id } } }
            source
            relations {
                nodes { id type format }
                edges { relationType }
            }
          stats {
            scoreDistribution {
              score
              amount
            }
          }
        }
    }
}
`;
