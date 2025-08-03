-- This migration adds search vector columns and functions for full-text search

-- Search vector columns already added in initial schema, so we skip that part

-- Création des triggers pour maintenir les vecteurs de recherche à jour
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

CREATE OR REPLACE FUNCTION marketing_banners_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title_237, '')), 'A');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_banners_search_update
BEFORE INSERT OR UPDATE ON marketing_banners
FOR EACH ROW EXECUTE FUNCTION marketing_banners_search_vector_update();