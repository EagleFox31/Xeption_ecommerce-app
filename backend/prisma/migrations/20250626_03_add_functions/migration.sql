-- Functions from functions.txt

-- assign_sku_from_category
CREATE OR REPLACE FUNCTION public.assign_sku_from_category()
RETURNS TRIGGER AS $$
DECLARE
  prefix text;
BEGIN
  -- Si le SKU est déjà renseigné manuellement, ne rien faire
  IF NEW.sku IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Récupère le préfixe associé à la catégorie
  SELECT prefix INTO prefix
  FROM category_sku_prefix
  WHERE category_id = NEW.category_id;

  IF prefix IS NULL THEN
    RAISE EXCEPTION 'Aucun prefix SKU défini pour category_id %', NEW.category_id;
  END IF;

  -- Génère et assigne le SKU
  NEW.sku := get_next_sku(prefix);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- check_technician_availability
CREATE OR REPLACE FUNCTION public.check_technician_availability()
RETURNS TRIGGER AS $$
DECLARE
  requested_date date;
  technician_id uuid;
  availability time[];
BEGIN
  requested_date := NEW.preferred_date;
  technician_id := NEW.created_by; -- ou récupérer via mapping de l'équipe

  SELECT available_hours
  INTO availability
  FROM technician_availability
  WHERE technician_id = technician_id AND available_date = requested_date;

  IF availability IS NULL THEN
    RAISE EXCEPTION 'Aucun créneau disponible pour la date % (technicien %)', requested_date, technician_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- gen_sku_for_products
CREATE OR REPLACE FUNCTION public.gen_sku_for_products()
RETURNS TRIGGER AS $$
DECLARE
  seq_no bigint;
  pfx     text;
BEGIN
  -- on prend le code déjà stocké
  SELECT c.sku_prefix INTO pfx
    FROM public.categories c
   WHERE c.id = NEW.category_id;

  UPDATE public.sku_counters
     SET last_seq = last_seq + 1
   WHERE prefix = pfx
   RETURNING last_seq INTO seq_no;

  NEW.sku := pfx || '-' || lpad(seq_no::text,4,'0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- get_next_sku
CREATE OR REPLACE FUNCTION public.get_next_sku(prefix text)
RETURNS text AS $$
DECLARE
  next_seq bigint;
BEGIN
  -- Verrou exclusif sur la ligne du préfixe
  UPDATE sku_counters
  SET last_seq = last_seq + 1
  WHERE prefix = get_next_sku.prefix
  RETURNING last_seq INTO next_seq;

  -- Si le préfixe n'existe pas encore, on le crée
  IF NOT FOUND THEN
    INSERT INTO sku_counters(prefix, last_seq)
    VALUES (prefix, 1)
    RETURNING last_seq INTO next_seq;
  END IF;

  -- Retourne un SKU formaté (ex: LAP-0000123)
  RETURN prefix || '-' || LPAD(next_seq::text, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- update_product_has_variants
CREATE OR REPLACE FUNCTION public.update_product_has_variants()
RETURNS TRIGGER AS $$
DECLARE
  variant_count integer;
BEGIN
  -- Compte les variantes du produit concerné
  SELECT COUNT(*) INTO variant_count
  FROM product_variants
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);

  -- Met à jour le produit en fonction du résultat
  UPDATE products
  SET has_variants = (variant_count > 0)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- trg_update_specs_cache
CREATE OR REPLACE FUNCTION public.trg_update_specs_cache()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_product_specs_cache(NEW.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trg_log_backorder_notification
CREATE OR REPLACE FUNCTION public.trg_log_backorder_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notification_sent = true AND OLD.notification_sent = false THEN
    INSERT INTO public.back_order_notifications (
      back_order_id, product_id, notified_by
    )
    VALUES (
      NEW.id,
      (SELECT id FROM products WHERE sku = NEW.product_ref LIMIT 1), -- hypothèse : SKU utilisé comme ref
      current_setting('app.user_id', true)::uuid
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- sync_i18n_descriptions
CREATE OR REPLACE FUNCTION public.sync_i18n_descriptions()
RETURNS TRIGGER AS $$
DECLARE
  i18n jsonb;
BEGIN
  SELECT jsonb_object_agg(locale, to_jsonb(row))
  INTO i18n
  FROM (
    SELECT locale, title, short_desc, long_desc, details_json
    FROM product_descriptions
    WHERE product_id = NEW.product_id
  ) row;

  UPDATE products
  SET i18n_descriptions = i18n
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- recalculate_product_stock
CREATE OR REPLACE FUNCTION public.recalculate_product_stock(productId bigint)
RETURNS void AS $$
DECLARE
  stock integer;
BEGIN
  SELECT COALESCE(SUM(stock_qty), 0)
  INTO stock
  FROM product_variants
  WHERE product_id = productId;

  UPDATE products
  SET stock_qty = stock
  WHERE id = productId;
END;
$$ LANGUAGE plpgsql;

-- refresh_product_specs_cache
CREATE OR REPLACE FUNCTION public.refresh_product_specs_cache(product_id bigint)
RETURNS void AS $$
DECLARE
  specs jsonb;
  features jsonb;
BEGIN
  -- Agréger les specs
  SELECT jsonb_object_agg(label, value)
  INTO specs
  FROM product_specifications
  WHERE product_specifications.product_id = refresh_product_specs_cache.product_id;

  -- Agréger les features
  SELECT jsonb_agg(jsonb_build_object(
    'title', title,
    'icon', icon_url,
    'highlight', highlight
  ))
  INTO features
  FROM product_features
  WHERE product_features.product_id = refresh_product_specs_cache.product_id;

  -- Mise à jour du cache dans products.specs
  UPDATE products
  SET specs = jsonb_build_object(
    'specifications', COALESCE(specs, '{}'),
    'features', COALESCE(features, '[]'::jsonb)
  )
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  uid uuid := current_setting('app.user_id', true)::uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, before_state, after_state
  )
  VALUES (
    uid,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at := now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for functions

-- Trigger for SKU generation
CREATE TRIGGER before_product_insert
BEFORE INSERT ON products
FOR EACH ROW
WHEN (NEW.sku IS NULL)
EXECUTE FUNCTION assign_sku_from_category();

-- Trigger for has_variants update
CREATE TRIGGER after_variant_change
AFTER INSERT OR UPDATE OR DELETE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_has_variants();

-- Trigger for specs cache update
CREATE TRIGGER after_specification_change
AFTER INSERT OR UPDATE ON product_specifications
FOR EACH ROW
EXECUTE FUNCTION trg_update_specs_cache();

CREATE TRIGGER after_feature_change
AFTER INSERT OR UPDATE ON product_features
FOR EACH ROW
EXECUTE FUNCTION trg_update_specs_cache();

-- Trigger for backorder notification
CREATE TRIGGER after_backorder_update
AFTER UPDATE ON back_orders
FOR EACH ROW
EXECUTE FUNCTION trg_log_backorder_notification();

-- Trigger for i18n descriptions
CREATE TRIGGER after_description_change
AFTER INSERT OR UPDATE ON product_descriptions
FOR EACH ROW
EXECUTE FUNCTION sync_i18n_descriptions();

-- Trigger for updated_at field
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Additional indexes for search and performance
CREATE INDEX IF NOT EXISTS banner_search ON public.marketing_banners USING gin (search_vector);
CREATE INDEX IF NOT EXISTS products_gin_search ON public.products USING gin (search_vector);