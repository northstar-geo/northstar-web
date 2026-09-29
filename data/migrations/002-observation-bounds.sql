ALTER TABLE observations ADD COLUMN estimate_bound TEXT CHECK(estimate_bound IN ('at-least','less-than'));
ALTER TABLE observations ADD COLUMN raw_value TEXT;
INSERT INTO schema_migrations VALUES (2);
