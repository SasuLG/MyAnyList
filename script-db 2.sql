/**
Pas de characters/staff, pas de relations veres les animes/pas de studios (ni de score) (si vouloir tout ça -> utiliser l'api anilist pour les séries)
**/

/* --- Table principale : Manga (AniList / MAL etc.) --- */
create table if not exists "Manga" (
    "id" serial primary key,
    "anilist_id" integer unique not null,           /* ID AniList */
    "title_romaji" varchar,
    "title_native" varchar,
    "title_english" varchar,
    "synopsis" text not null,
    "cover_image" varchar,                          /* url cover (préférer large) */
    "banner_image" varchar,                         /* bannerImage */
    "format" varchar,                               /* MANGA / MANHWA / NOVEL / ... */
    "status" varchar,                               /* FINISHED / RELEASING / ... */
    "isAdult" boolean not null default false,
    "chapters" integer,
    "volumes" integer,
    "averageScore" float,
    "meanScore" float,
    "popularity" integer,
    "source" varchar,                               /* source field from AniList (ex: "MANGA") */
    "start_date" date,
    "end_date" date,
    "last_modified" timestamp not null default current_timestamp /* La date de dernière modification */
);

/* --- Synonymes (titres alternatifs) --- */
create table if not exists "Synonym_manga" (
    "id" serial primary key,
    "mangaId" integer not null,
    "name" varchar not null
);

/* --- Origine pays (jonction avec votre table Country existante) --- */
create table if not exists "OriginCountry_manga" (
    "mangaId" integer not null,
    "countryId" integer not null,
    primary key ("mangaId","countryId")
);

create table if not exists "Genre_external" (
    "id" serial primary key,
    "name" varchar
);

/* --- Genres pour manga : jonction vers votre table Genre existante --- */
create table if not exists "Genre_manga" (
    "mangaId" integer not null,
    "genreId" integer not null,
    primary key ("mangaId","genreId")
);

/* --- Tags AniList externes (métadonnées complètes des tags AniList) --- */
create table if not exists "Tag_external" (
    "id" serial primary key,
    "anilist_id" integer unique,                    /* id du tag côté AniList */
    "name" varchar,
    "description" text,
    "category" varchar,
    "rank" integer,
    "isAdult" boolean not null default false
);

/* --- Association manga <-> Tag interne (si vous avez déjà un Tag local) --- */
create table if not exists "Tag_manga" (
    "mangaId" integer not null,
    "tagId" integer not null,                       /* référence votre table "Tag" */
    primary key ("mangaId","tagId")
);

/* --- Association manga <-> Tag externe (AniList) --- */
create table if not exists "Tag_external_manga" (
    "mangaId" integer not null,
    "tagExternalId" integer not null,               /* référence Tag_external.id */
    primary key ("mangaId","tagExternalId")
);

/* --- Stats (scoreDistribution etc.) --- */
create table if not exists "Manga_stats" (
    "mangaId" integer primary key,
    "scoreDistribution" jsonb                      /* tableau {score, amount} */
);

/* --- Relations utilisateur (même logique que pour les séries) --- */
create table if not exists "User_manga"(
    "user_id" integer not null,
    "manga_id" integer not null,
    "date" timestamp not null default current_timestamp,
    primary key ("user_id","manga_id")
);

create table if not exists "User_wait_manga"(
    "user_id" integer not null,
    "manga_id" integer not null,
    "date" timestamp not null default current_timestamp,
    primary key ("user_id","manga_id")
);

create table if not exists "User_note_manga"(
    "user_id" integer not null,
    "manga_id" integer not null,
    "note" float not null,
    "comment" text,
    primary key ("user_id","manga_id")
);

ALTER TABLE "Country" ADD CONSTRAINT country_iso_unique UNIQUE ("iso_3166_1");
ALTER TABLE "Genre_external" ADD CONSTRAINT genre_external_name_unique UNIQUE ("name");
ALTER TABLE "Synonym_manga" ADD CONSTRAINT synonym_manga_unique UNIQUE ("mangaId", "name");
