-- Create all enum types first
CREATE TYPE "UserRole" AS ENUM ('client', 'agent', 'admin');
CREATE TYPE "OrderStatusEnum" AS ENUM ('new', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE "PaymentStatusEnum" AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE "PaymentMethodEnum" AS ENUM ('om', 'momo', 'card', 'cash', 'paypal');
CREATE TYPE "TradeStatusEnum" AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled', 'quoted');
CREATE TYPE "PhysicalConditionEnum" AS ENUM ('excellent', 'good', 'fair', 'poor', 'damaged');
CREATE TYPE "BatteryStateEnum" AS ENUM ('excellent', 'good', 'average', 'poor', 'needs_replacement');
CREATE TYPE "BackOrderStatusEnum" AS ENUM ('open', 'sourced', 'ordered', 'cancelled');
CREATE TYPE "BudgetStatusEnum" AS ENUM ('open', 'in_consult', 'closed');
CREATE TYPE "RepairStatusEnum" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "RfqStatusEnum" AS ENUM ('new', 'answered', 'won', 'lost', 'draft', 'submitted', 'under_review', 'quoted', 'rejected', 'approved', 'closed');
CREATE TYPE "ProductTierEnum" AS ENUM ('entry', 'standard', 'premium', 'pro');
CREATE TYPE "InventoryReasonEnum" AS ENUM ('purchase', 'return', 'manual', 'sale', 'adjust');

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create all tables

-- Users table
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT,
  "phone_237" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'client',
  "loyalty_points" INTEGER NOT NULL DEFAULT 0,
  "preferred_lang" TEXT NOT NULL DEFAULT 'fr',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Regions table
CREATE TABLE "regions" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE
);

-- Cities table
CREATE TABLE "cities" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "region_id" INTEGER NOT NULL,
  FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Communes table
CREATE TABLE "communes" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "city_id" INTEGER NOT NULL,
  FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Addresses table
CREATE TABLE "addresses" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'Cameroon',
  "region_id" INTEGER,
  "city_id" INTEGER,
  "commune_id" INTEGER,
  "address_line" TEXT NOT NULL,
  "latitude" DECIMAL,
  "longitude" DECIMAL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Categories table
CREATE TABLE "categories" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "parent_id" BIGINT,
  "sku_prefix" TEXT NOT NULL DEFAULT '',
  FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CategorySkuPrefix table
CREATE TABLE "category_sku_prefix" (
  "category_id" BIGINT PRIMARY KEY,
  "prefix" TEXT NOT NULL UNIQUE,
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Brands table
CREATE TABLE "brands" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CategoryBrands table
CREATE TABLE "category_brands" (
  "category_id" BIGINT NOT NULL,
  "brand_id" BIGINT NOT NULL,
  PRIMARY KEY ("category_id", "brand_id"),
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ProductSeries table
CREATE TABLE "product_series" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "category_id" BIGINT NOT NULL,
  "brand_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Products table
CREATE TABLE "products" (
  "id" BIGSERIAL PRIMARY KEY,
  "sku" TEXT UNIQUE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "category_id" BIGINT NOT NULL,
  "price_xaf" DECIMAL NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'XAF',
  "stock_qty" INTEGER NOT NULL DEFAULT 0,
  "weight_kg" DECIMAL,
  "dimensions_mm" JSONB,
  "specs" JSONB,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "brand_id" BIGINT,
  "i18n_descriptions" JSONB,
  "series_id" BIGINT,
  "tier" "ProductTierEnum" NOT NULL DEFAULT 'standard',
  "promo_pct" INTEGER NOT NULL DEFAULT 0,
  "promo_price_xaf" DECIMAL,
  "has_variants" BOOLEAN NOT NULL DEFAULT false,
  "search_vector" tsvector,
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("series_id") REFERENCES "product_series"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ProductImages table
CREATE TABLE "product_images" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "image_url" TEXT NOT NULL,
  "position" INTEGER DEFAULT 0,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ProductFeatures table
CREATE TABLE "product_features" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "title" TEXT NOT NULL,
  "icon_url" TEXT,
  "highlight" BOOLEAN DEFAULT true,
  "position" INTEGER DEFAULT 0,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ProductSpecifications table
CREATE TABLE "product_specifications" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "label" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "unit" TEXT,
  "value_type" TEXT DEFAULT 'string',
  "position" INTEGER DEFAULT 0,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ProductDescriptions table
CREATE TABLE "product_descriptions" (
  "product_id" BIGINT NOT NULL,
  "locale" TEXT NOT NULL,
  "title" TEXT,
  "short_desc" TEXT,
  "long_desc" TEXT,
  "details_json" JSONB,
  PRIMARY KEY ("product_id", "locale"),
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- VariantAttributes table
CREATE TABLE "variant_attributes" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "value_type" TEXT DEFAULT 'string'
);

-- VariantValues table
CREATE TABLE "variant_values" (
  "id" BIGSERIAL PRIMARY KEY,
  "attribute_id" BIGINT NOT NULL,
  "value" TEXT NOT NULL,
  "normalized_value" TEXT,
  "position" INTEGER DEFAULT 0,
  FOREIGN KEY ("attribute_id") REFERENCES "variant_attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ProductVariants table
CREATE TABLE "product_variants" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "variant_key" TEXT NOT NULL,
  "attrs" JSONB NOT NULL,
  "extra_price_xaf" DECIMAL DEFAULT 0,
  "stock_qty" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ProductVariantValues table
CREATE TABLE "product_variant_values" (
  "variant_id" BIGINT NOT NULL,
  "attribute_id" BIGINT NOT NULL,
  "value_id" BIGINT NOT NULL,
  PRIMARY KEY ("variant_id", "attribute_id"),
  FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("attribute_id") REFERENCES "variant_attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("value_id") REFERENCES "variant_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Carts table
CREATE TABLE "carts" (
  "user_id" TEXT PRIMARY KEY,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CartItems table
CREATE TABLE "cart_items" (
  "id" BIGSERIAL PRIMARY KEY,
  "cart_user_id" TEXT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "variant_id" BIGINT,
  "qty" INTEGER NOT NULL,
  FOREIGN KEY ("cart_user_id") REFERENCES "carts"("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Orders table
CREATE TABLE "orders" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "amount_xaf" DECIMAL NOT NULL,
  "shipping_fee_xaf" DECIMAL DEFAULT 0,
  "tax_xaf" DECIMAL DEFAULT 0,
  "discount_xaf" DECIMAL DEFAULT 0,
  "payment_status" "PaymentStatusEnum" NOT NULL DEFAULT 'pending',
  "payment_method" "PaymentMethodEnum",
  "delivery_method" TEXT NOT NULL,
  "delivery_address_id" BIGINT,
  "tracking_code" TEXT,
  "status" "OrderStatusEnum" NOT NULL DEFAULT 'new',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- OrderItems table
CREATE TABLE "order_items" (
  "id" BIGSERIAL PRIMARY KEY,
  "order_id" TEXT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "variant_id" BIGINT,
  "qty" INTEGER NOT NULL,
  "unit_price_xaf" DECIMAL NOT NULL,
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- TradeIns table
CREATE TABLE "trade_ins" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "device_type" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "physical_condition" "PhysicalConditionEnum" NOT NULL DEFAULT 'fair',
  "battery_state" "BatteryStateEnum" NOT NULL DEFAULT 'average',
  "invoice_provided" BOOLEAN NOT NULL DEFAULT false,
  "is_unlocked" BOOLEAN NOT NULL DEFAULT true,
  "quote_value_xaf" DECIMAL,
  "status" "TradeStatusEnum" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- TradeInPhotos table
CREATE TABLE "trade_in_photos" (
  "id" BIGSERIAL PRIMARY KEY,
  "trade_in_id" TEXT NOT NULL,
  "photo_url" TEXT NOT NULL,
  FOREIGN KEY ("trade_in_id") REFERENCES "trade_ins"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Deliveries table
CREATE TABLE "deliveries" (
  "id" BIGSERIAL PRIMARY KEY,
  "region_id" INTEGER NOT NULL,
  "city_id" INTEGER,
  "commune_id" INTEGER,
  "fee_xaf" DECIMAL NOT NULL,
  "eta_days" INTEGER DEFAULT 2,
  "cash_on_delivery" BOOLEAN DEFAULT true,
  FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- InventoryLogs table
CREATE TABLE "inventory_logs" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "qty_change" INTEGER NOT NULL,
  "reason" "InventoryReasonEnum" NOT NULL,
  "actor_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- BackOrders table
CREATE TABLE "back_orders" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "product_ref" TEXT NOT NULL,
  "desired_qty" INTEGER NOT NULL DEFAULT 1,
  "max_budget_xaf" DECIMAL,
  "status" "BackOrderStatusEnum" NOT NULL DEFAULT 'open',
  "agent_note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notification_sent" BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- BackOrderNotifications table
CREATE TABLE "back_order_notifications" (
  "id" BIGSERIAL PRIMARY KEY,
  "back_order_id" TEXT,
  "product_id" BIGINT,
  "notified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notified_by" TEXT,
  FOREIGN KEY ("back_order_id") REFERENCES "back_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("notified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- BudgetAdvisories table
CREATE TABLE "budget_advisories" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "budget_xaf" DECIMAL NOT NULL,
  "usage_context" TEXT,
  "status" "BudgetStatusEnum" NOT NULL DEFAULT 'open',
  "agent_suggestions" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RepairJobs table
CREATE TABLE "repair_jobs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "device_info" JSONB NOT NULL,
  "problem_desc" TEXT NOT NULL,
  "preferred_date" TIMESTAMP(3),
  "status" "RepairStatusEnum" NOT NULL DEFAULT 'scheduled',
  "technician_notes" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- TechnicianAvailability table
CREATE TABLE "technician_availability" (
  "technician_id" TEXT NOT NULL,
  "available_date" TIMESTAMP(3) NOT NULL,
  "available_hours" TEXT[] NOT NULL,
  PRIMARY KEY ("technician_id", "available_date"),
  FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Rfqs table
CREATE TABLE "rfqs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_name" TEXT NOT NULL,
  "contact_name" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "budget_min_xaf" DECIMAL,
  "budget_max_xaf" DECIMAL,
  "rfq_status" "RfqStatusEnum" NOT NULL DEFAULT 'draft',
  "answer_doc_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_urgent" BOOLEAN DEFAULT false,
  "comment" TEXT,
  "delivery_deadline" TIMESTAMP(3),
  "submitted_at" TIMESTAMP(3),
  "created_by" TEXT,
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RfqItems table
CREATE TABLE "rfq_items" (
  "id" BIGSERIAL PRIMARY KEY,
  "rfq_id" TEXT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "qty" INTEGER NOT NULL,
  "specs_note" TEXT,
  FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- MarketingBanners table
CREATE TABLE "marketing_banners" (
  "id" BIGSERIAL PRIMARY KEY,
  "title_237" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "cta_url" TEXT NOT NULL,
  "category_id" BIGINT,
  "priority" INTEGER DEFAULT 0,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN DEFAULT true,
  "search_vector" tsvector,
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Promotions table
CREATE TABLE "promotions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" BIGINT NOT NULL,
  "promo_pct" INTEGER NOT NULL,
  "starts_at" TIMESTAMP(3) NOT NULL,
  "ends_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- SkuCounters table
CREATE TABLE "sku_counters" (
  "prefix" TEXT PRIMARY KEY,
  "last_seq" BIGINT NOT NULL DEFAULT 0
);

-- Settings table
CREATE TABLE "settings" (
  "key" TEXT PRIMARY KEY,
  "value" JSONB NOT NULL
);

-- AuditLogs table
CREATE TABLE "audit_logs" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_id" TEXT,
  "action" TEXT NOT NULL,
  "table_name" TEXT NOT NULL,
  "record_id" TEXT,
  "before_state" JSONB,
  "after_state" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "products_price_cat" ON "products" USING btree ("category_id", "price_xaf");
CREATE INDEX "order_items_product_variant" ON "order_items" USING btree ("product_id", "variant_id");
CREATE INDEX "invlogs_product_time" ON "inventory_logs" USING btree ("product_id", "created_at" DESC);
CREATE INDEX "back_order_status" ON "back_orders" USING btree ("status", "created_at" DESC);
CREATE INDEX "budget_adv_status" ON "budget_advisories" USING btree ("status", "created_at" DESC);
CREATE INDEX "rfq_status_time" ON "rfqs" USING btree ("rfq_status", "created_at" DESC);