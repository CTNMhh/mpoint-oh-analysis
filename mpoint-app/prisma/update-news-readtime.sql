-- Update-Skript: Fügt Lesedauer (readTime) zu bestehenden News-Datensätzen hinzu
-- Passe die IDs und Werte ggf. an deine Datenbank an

UPDATE "News" SET "readTime" = '7 Min.' WHERE "id" = 'news-1';
UPDATE "News" SET "readTime" = '5 Min.' WHERE "id" = 'news-2';
UPDATE "News" SET "readTime" = '6 Min.' WHERE "id" = 'news-3';
UPDATE "News" SET "readTime" = '8 Min.' WHERE "id" = 'news-4';
UPDATE "News" SET "readTime" = '5 Min.' WHERE "id" = 'news-5';
