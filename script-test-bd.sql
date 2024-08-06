-- Supprimer les tables avec leurs contraintes
DROP TABLE IF EXISTS "User_serie" CASCADE;
DROP TABLE IF EXISTS "User_episode" CASCADE;
DROP TABLE IF EXISTS "Country_serie" CASCADE;
DROP TABLE IF EXISTS "Genre_serie" CASCADE;
DROP TABLE IF EXISTS "User_note" CASCADE;
DROP TABLE IF EXISTS "ProductionCompany_serie" CASCADE;
DROP TABLE IF EXISTS "ProductionCountry_serie" CASCADE;
DROP TABLE IF EXISTS "Language_serie" CASCADE;
DROP TABLE IF EXISTS "Episode" CASCADE;
DROP TABLE IF EXISTS "Season" CASCADE;
DROP TABLE IF EXISTS "Serie" CASCADE;
DROP TABLE IF EXISTS "ProductionCompany" CASCADE;
DROP TABLE IF EXISTS "Language" CASCADE;
DROP TABLE IF EXISTS "Genre" CASCADE;
DROP TABLE IF EXISTS "Country" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "OriginCountry_serie" CASCADE;



-- Désactiver les contraintes de clés étrangères
SET session_replication_role = replica;

-- Supprimer toutes les données des tables
TRUNCATE TABLE "User", "Country", "Country_serie", "Genre", "Genre_serie", "OriginCountry_serie", 
    "Serie", "ProductionCompany", "ProductionCompany_serie", 
    "ProductionCountry_serie", "Language", "Language_serie", "Episode", "Season", "User_serie", "User_episode", "User_note"
    CASCADE;

-- Réactiver les contraintes de clés étrangères
SET session_replication_role = DEFAULT;

/*User_episode*/