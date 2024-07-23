/* Création de la table des utilisateurs */
create table if not exists "User" (
    "id" serial primary key,
    "login" varchar unique not null, /* L'identifiant de connexion */
    "password" varchar not null, /* Le mot de passe hashé en bcrypt */
    "banned" boolean not null default false, /* Si l'utilisateur est banni */
    "admin" boolean not null default false, /* Si l'utilisateur est administrateur */
    "createdAt" timestamp not null default current_timestamp, /* La date de création du compte */
    "last_activity" timestamp not null default current_timestamp, /* La date de la dernière activité */
    "web_token" varchar /* Le token de connexion web */
);

/* Création de la table des pays */
create table if not exists "Country" (
    "id" serial primary key,
    "name" varchar unique not null /* Le nom du pays */
);

/* Création de la table des pays d'une série*/
create table if not exists "Country_serie" (
    "serieId" integer not null, /* L'identifiant de la série */
    "countryId" integer not null, /* L'identifiant du pays */
    primary key ("serieId", "countryId")
);

/* Création de la table des genres */
create table if not exists "Genre" (
    "id" serial primary key,
    "tmdb_id" integer unique not null, /* L'identifiant TMDB du genre */
    "name" varchar unique not null /* Le nom du genre */
);

/* Création des genre d'une série */
create table if not exists "Genre_serie" (
    "serieId" integer not null, /* L'identifiant de la série */
    "genreId" integer not null, /* L'identifiant du genre */
    primary key ("serieId", "genreId")
);

/* Création de la table des acteurs */
create table if not exists "Actor" (
    "id" serial primary key,
    "name" varchar unique not null /* Le nom de l'acteur */
);

/* Création de la table des acteurs d'une série */
create table if not exists "Actor_serie" (
    "serieId" integer not null, /* L'identifiant de la série */
    "actorId" integer not null, /* L'identifiant de l'acteur */
    primary key ("serieId", "actorId")
);

/* Création de la table des external rating */
create table if not exists "ExternalRating" (
    "id" serial primary key,
    "serie_id" integer not null, /* L'identifiant de la série */
    "source_id" integer not null, /* L'identifiant de la source */
    "value" varchar not null, /* La note */
    "votes" integer not null /* Le nombre de votes */
);
/* Création de la table des source external rating*/
create table if not exists "ExternalRatingSource" (
    "id" serial primary key,
    "name" varchar unique not null /* Le nom de la source */
);

/* Création de la table des séries*/
create table if not exists "Serie" (
    "id" serial primary key,
    "tmdb_id" integer unique not null, /* L'identifiant TMDB de la série */
    "title" varchar not null, /* Le titre de la série */
    "overview" text not null, /* La description de la série */
    "poster" varchar, /* L'affiche de la série */
    "backdrop" varchar, /* L'image de fond de la série */
    "media" varchar, /* Le média de la série */
    "original_name" varchar, /* Le titre original de la série */
    "status" varchar, /* Le statut de la série */
    "first_air_date" date, /* La date de première diffusion */
    "last_air_date" date, /* La date de dernière diffusion */
    "episode_run_time" integer, /* La durée d'un épisode */
    "total_time" integer, /* La durée totale de la série */
    "nb_seasons" integer, /* Le nombre de saisons */
    "nb_episodes" integer /* Le nombre d'épisodes */

    /*networks*/
);

create table if not exists "ProductionCompany" (
    "id" serial primary key,
    "tmdb_id" integer unique not null, /* L'identifiant TMDB de la société de production */
    "name" varchar unique not null /* Le nom de la société de production */
);

create table if not exists "ProductionCompany_serie" (
    "serieId" integer not null, /* L'identifiant de la série */
    "productionCompanyId" integer not null, /* L'identifiant de la société de production */
    primary key ("serieId", "productionCompanyId")
);

create table if not exists "ProductionCountry_serie" (
    "serieId" integer not null, /* L'identifiant de la série */
    "countryId" integer not null, /* L'identifiant du pays de production */
    primary key ("serieId", "countryId")
);

create table if not exists "Language" (
    "id" serial primary key,
    "name" varchar unique not null /* Le nom de la langue */
);

create table if not exists "Language_serie" (
    "serieId" integer not null, /* L'identifiant de la série */
    "languageId" integer not null, /* L'identifiant de la langue */
    primary key ("serieId", "languageId")
);

/* Création de la table des épisodes*/
create table if not exists "Episode" (
    "id" serial primary key,
    "tmdb_id" integer unique not null, /* L'identifiant TMDB de l'épisode */
    "season_id" integer not null, /* L'identifiant de la saison */
    "number" integer not null, /* Le numéro de l'épisode */
    "title" varchar not null, /* Le titre de l'épisode */
    "overview" text not null, /* La description de l'épisode */
    "name" varchar, /* Le nom de l'épisode */
    "runtime" integer, /* La durée de l'épisode */
    "still_path" varchar /* L'image de l'épisode */

    /* crew */
);

/* Création de la table des saisons*/
create table if not exists "Season" (
    "id" serial primary key,
    "tmdb_id" integer unique not null, /* L'identifiant TMDB de la saison */
    "serie_id" integer not null, /* L'identifiant de la série */
    "number" integer not null, /* Le numéro de la saison */
    "overview" text not null, /* La description de la saison */
    "poster_path" varchar, /* L'affiche de la saison */

/* pas sur TODO*/
    "total_time" integer, /* La durée totale de la saison */
    "air_date" date, /* La date de diffusion */
    "vote_average" float /* La note moyenne */
);

/* Création de la table user séries*/
create table if not exists "User_serie"(
    "user_id" integer not null, /* L'identifiant de l'utilisateur */
    "serie_id" integer not null, /* L'identifiant de la série */
    primary key ("user_id", "serie_id")
);

/* Création de la table user episode*/
create table if not exists "User_episode"(
    "user_id" integer not null, /* L'identifiant de l'utilisateur */
    "episode_id" integer not null, /* L'identifiant de l'épisode */
    primary key ("user_id", "episode_id")
);

/* Ajout des contraintes de clés étrangères */
alter table "User_serie" add constraint fk_user_serie_user foreign key ("user_id") references "User" ("id");
alter table "User_serie" add constraint fk_user_serie_serie foreign key ("serie_id") references "Serie" ("id");
alter table "User_episode" add constraint fk_user_episode_user foreign key ("user_id") references "User" ("id");
alter table "User_episode" add constraint fk_user_episode_episode foreign key ("episode_id") references "Episode" ("id");
alter table "Country_serie" add constraint fk_Country_serie_serie foreign key ("serieId") references "Serie" ("id");
alter table "Country_serie" add constraint fk_Country_serie_country foreign key ("countryId") references "Country" ("id");
alter table "Genre_serie" add constraint fk_genre_serie_serie foreign key ("serieId") references "Serie" ("id");
alter table "Genre_serie" add constraint fk_genre_serie_genre foreign key ("genreId") references "Genre" ("id");
alter table "Actor_serie" add constraint fk_actor_serie_serie foreign key ("serieId") references "Serie" ("id");
alter table "Actor_serie" add constraint fk_actor_serie_actor foreign key ("actorId") references "Actor" ("id");
alter table "ExternalRating" add constraint fk_external_rating_serie foreign key ("serie_id") references "Serie" ("id");
alter table "ExternalRating" add constraint fk_external_rating_source foreign key ("source_id") references "ExternalRatingSource" ("id");
alter table "ProductionCompany_serie" add constraint fk_production_company_serie_serie foreign key ("serieId") references "Serie" ("id");
alter table "ProductionCompany_serie" add constraint fk_production_company_serie_production_company foreign key ("productionCompanyId") references "ProductionCompany" ("id");
alter table "ProductionCountry_serie" add constraint fk_production_country_serie_serie foreign key ("serieId") references "Serie" ("id");
alter table "ProductionCountry_serie" add constraint fk_production_country_serie_country foreign key ("countryId") references "Country" ("id");
alter table "Language_serie" add constraint fk_language_serie_serie foreign key ("serieId") references "Serie" ("id");
alter table "Language_serie" add constraint fk_language_serie_language foreign key ("languageId") references "Language" ("id");
alter table "Episode" add constraint fk_episode_season foreign key ("season_id") references "Season" ("id");
alter table "Season" add constraint fk_season_serie foreign key ("serie_id") references "Serie" ("id");

-- Fonction pour mettre à jour le temps total de la saison
CREATE OR REPLACE FUNCTION update_season_total_time()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Season"
    SET "total_time" = (SELECT COALESCE(SUM("runtime"), 0) FROM "Episode" WHERE "season_id" = NEW.season_id)
    WHERE "id" = NEW.season_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le temps total de la série
CREATE OR REPLACE FUNCTION update_serie_total_time()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Serie"
    SET "total_time" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = NEW.serie_id)
    WHERE "id" = NEW.serie_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour mettre à jour le temps total de la saison après l'insertion ou la mise à jour d'un épisode
CREATE OR REPLACE TRIGGER update_season_total_time_trigger
AFTER INSERT OR UPDATE ON "Episode"
FOR EACH ROW
EXECUTE FUNCTION update_season_total_time();

-- Déclencheur pour mettre à jour le temps total de la série après la mise à jour d'une saison
CREATE OR REPLACE TRIGGER update_serie_total_time_trigger
AFTER UPDATE OF "total_time" ON "Season"
FOR EACH ROW
EXECUTE FUNCTION update_serie_total_time();


/* 
 *	Création du rôle d'accès à la bdd
 */

create role "Manyl-User" with login password 'D@*987d7v?YLsEL2_it';

ALTER DATABASE "MyAnyList" OWNER TO "Manyl-User";
