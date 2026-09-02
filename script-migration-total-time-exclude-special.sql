
ALTER TABLE "Serie" ADD COLUMN IF NOT EXISTS "total_time_exclude_special" integer DEFAULT 0;

CREATE OR REPLACE FUNCTION update_serie_total_time()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Serie"
    SET "total_time" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = NEW.serie_id),
        "total_time_exclude_special" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = NEW.serie_id AND "name" != 'Épisodes spéciaux')
    WHERE "id" = NEW.serie_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

UPDATE "Serie" 
SET "total_time" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = "Serie"."id"),
    "total_time_exclude_special" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = "Serie"."id" AND "name" != 'Épisodes spéciaux');


/*
CREATE OR REPLACE FUNCTION fn_sync_season_runtime()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        UPDATE "Season"
        SET "total_time" = (SELECT COALESCE(SUM("runtime"), 0) FROM "Episode" WHERE "season_id" = OLD.season_id)
        WHERE "id" = OLD.season_id;
    END IF;

    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE "Season"
        SET "total_time" = (SELECT COALESCE(SUM("runtime"), 0) FROM "Episode" WHERE "season_id" = NEW.season_id)
        WHERE "id" = NEW.season_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_episode_changes ON "Episode";
CREATE TRIGGER trg_episode_changes
AFTER INSERT OR UPDATE OR DELETE ON "Episode"
FOR EACH ROW
EXECUTE FUNCTION fn_sync_season_runtime();

CREATE OR REPLACE FUNCTION fn_sync_serie_runtime()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        UPDATE "Serie"
        SET "total_time" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = OLD.serie_id),
            "total_time_exclude_special" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = OLD.serie_id AND "name" != 'Épisodes spéciaux')
        WHERE "id" = OLD.serie_id;
    END IF;

    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE "Serie"
        SET "total_time" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = NEW.serie_id),
            "total_time_exclude_special" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" WHERE "serie_id" = NEW.serie_id AND "name" != 'Épisodes spéciaux')
        WHERE "id" = NEW.serie_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_season_changes ON "Season";
CREATE TRIGGER trg_season_changes
AFTER INSERT OR DELETE OR UPDATE OF "total_time", "serie_id", "name" ON "Season"
FOR EACH ROW
EXECUTE FUNCTION fn_sync_serie_runtime();
*/

/*
UPDATE "Season" s
SET "total_time" = (SELECT COALESCE(SUM("runtime"), 0) FROM "Episode" e WHERE e."season_id" = s."id");

UPDATE "Serie" sr
SET "total_time" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" sn WHERE sn."serie_id" = sr."id"),
    "total_time_exclude_special" = (SELECT COALESCE(SUM("total_time"), 0) FROM "Season" sn WHERE sn."serie_id" = sr."id" AND sn."name" != 'Épisodes spéciaux');
    */