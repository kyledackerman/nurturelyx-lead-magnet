-- Add ambassador role to app_role enum (must be in separate transaction)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ambassador';