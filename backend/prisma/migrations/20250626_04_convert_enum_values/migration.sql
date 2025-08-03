-- This migration handles enum value conversions for existing data if present

-- Safely convert UserRole values (only if the column exists)
DO $$
BEGIN
    -- Only proceed if there are any users in the table
    IF EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
        -- Create temp column
        ALTER TABLE public.users ADD COLUMN temp_role TEXT;
        
        -- Copy current values
        UPDATE public.users SET temp_role = role::TEXT;
        
        -- Map old roles to new roles
        UPDATE public.users 
        SET temp_role = 'agent' 
        WHERE temp_role IN ('staff', 'technician');
        
        -- Drop and recreate role column
        ALTER TABLE public.users DROP COLUMN role;
        ALTER TABLE public.users ADD COLUMN role "UserRole" NOT NULL DEFAULT 'client';
        
        -- Update with mapped values
        UPDATE public.users SET role = temp_role::public."UserRole";
        
        -- Drop temp column
        ALTER TABLE public.users DROP COLUMN temp_role;
    END IF;
END
$$;

-- Safely update product tiers
DO $$
BEGIN
    -- Only proceed if there are products with these tiers
    IF EXISTS (SELECT 1 FROM public.products WHERE tier::TEXT IN ('enterprise', 'budget') LIMIT 1) THEN
        UPDATE public.products 
        SET tier = 'standard' 
        WHERE tier::TEXT IN ('enterprise', 'budget');
    END IF;
END
$$;

-- Safely update inventory reasons
DO $$
BEGIN
    -- Only proceed if there are inventory logs with these reasons
    IF EXISTS (SELECT 1 FROM public.inventory_logs WHERE reason::TEXT = 'adjustment' LIMIT 1) THEN
        UPDATE public.inventory_logs 
        SET reason = 'adjust' 
        WHERE reason::TEXT = 'adjustment';
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.inventory_logs WHERE reason::TEXT IN ('damaged', 'lost') LIMIT 1) THEN
        UPDATE public.inventory_logs 
        SET reason = 'manual' 
        WHERE reason::TEXT IN ('damaged', 'lost');
    END IF;
END
$$;

-- Safely update back order statuses
DO $$
BEGIN
    -- Only proceed if there are back orders with these statuses
    IF EXISTS (SELECT 1 FROM public.back_orders WHERE status::TEXT = 'processing' LIMIT 1) THEN
        UPDATE public.back_orders 
        SET status = 'sourced' 
        WHERE status::TEXT = 'processing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.back_orders WHERE status::TEXT = 'fulfilled' LIMIT 1) THEN
        UPDATE public.back_orders 
        SET status = 'ordered' 
        WHERE status::TEXT = 'fulfilled';
    END IF;
END
$$;

-- Safely update budget advisory statuses
DO $$
BEGIN
    -- Only proceed if there are budget advisories with these statuses
    IF EXISTS (SELECT 1 FROM public.budget_advisories WHERE status::TEXT = 'in_progress' LIMIT 1) THEN
        UPDATE public.budget_advisories 
        SET status = 'in_consult' 
        WHERE status::TEXT = 'in_progress';
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.budget_advisories WHERE status::TEXT IN ('completed', 'cancelled') LIMIT 1) THEN
        UPDATE public.budget_advisories 
        SET status = 'closed' 
        WHERE status::TEXT IN ('completed', 'cancelled');
    END IF;
END
$$;

-- Safely update payment methods in orders
DO $$
BEGIN
    -- Only proceed if payment_method column exists and contains values
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        
        -- Create temp column
        ALTER TABLE public.orders ADD COLUMN temp_payment_method TEXT;
        
        -- Copy values to temp column if any exist
        UPDATE public.orders SET temp_payment_method = payment_method::TEXT WHERE payment_method IS NOT NULL;
        
        -- Drop and recreate payment_method with proper type
        ALTER TABLE public.orders DROP COLUMN payment_method;
        ALTER TABLE public.orders ADD COLUMN payment_method "PaymentMethodEnum";
        
        -- Update with mapped values
        UPDATE public.orders 
        SET payment_method = 
            CASE 
                WHEN temp_payment_method = 'mobile_money' THEN 'momo'::public."PaymentMethodEnum"
                WHEN temp_payment_method = 'orange_money' THEN 'om'::public."PaymentMethodEnum"
                WHEN temp_payment_method = 'credit_card' THEN 'card'::public."PaymentMethodEnum"
                WHEN temp_payment_method IS NOT NULL THEN 'cash'::public."PaymentMethodEnum"
                ELSE NULL
            END;
            
        -- Drop temp column
        ALTER TABLE public.orders DROP COLUMN temp_payment_method;
    END IF;
END
$$;