-- Ajout des triggers d'audit sur les tables principales

-- Products
CREATE TRIGGER audit_products_changes
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Users
CREATE TRIGGER audit_users_changes
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Orders
CREATE TRIGGER audit_orders_changes
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Back Orders
CREATE TRIGGER audit_back_orders_changes
AFTER INSERT OR UPDATE OR DELETE ON back_orders
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Inventory Logs
CREATE TRIGGER audit_inventory_logs_changes
AFTER INSERT OR UPDATE ON inventory_logs
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- RFQs
CREATE TRIGGER audit_rfqs_changes
AFTER INSERT OR UPDATE OR DELETE ON rfqs
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Categories
CREATE TRIGGER audit_categories_changes
AFTER INSERT OR UPDATE OR DELETE ON categories
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Brands
CREATE TRIGGER audit_brands_changes
AFTER INSERT OR UPDATE OR DELETE ON brands
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Repair Jobs
CREATE TRIGGER audit_repair_jobs_changes
AFTER INSERT OR UPDATE OR DELETE ON repair_jobs
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Mise à jour de la documentation pour les développeurs
COMMENT ON FUNCTION public.log_audit_event() IS 'Fonction de journalisation d''audit qui enregistre les modifications dans la table audit_logs';
COMMENT ON FUNCTION public.set_updated_at() IS 'Met à jour le champ updated_at avec la date/heure actuelle lors des mises à jour';
COMMENT ON FUNCTION public.assign_sku_from_category() IS 'Génère automatiquement un SKU pour un produit basé sur sa catégorie';
COMMENT ON FUNCTION public.get_next_sku(text) IS 'Génère le prochain SKU dans la séquence pour un préfixe donné';