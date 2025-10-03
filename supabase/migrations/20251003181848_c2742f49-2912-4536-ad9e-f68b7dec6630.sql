-- Add industry categorization and SEO columns to reports table
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS monthly_traffic_tier TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS extracted_company_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN reports.industry IS 'Industry category: hvac, legal, real-estate, home-services, automotive, healthcare, other';
COMMENT ON COLUMN reports.company_size IS 'Company size tier: small, medium, large based on traffic and revenue';
COMMENT ON COLUMN reports.monthly_traffic_tier IS 'Traffic tier: low (0-100), medium (101-1000), high (1001-10000), enterprise (10000+)';
COMMENT ON COLUMN reports.seo_title IS 'SEO-optimized title for report page';
COMMENT ON COLUMN reports.seo_description IS 'SEO meta description for report page';
COMMENT ON COLUMN reports.city IS 'Extracted city from domain/business data';
COMMENT ON COLUMN reports.state IS 'Extracted state from domain/business data';
COMMENT ON COLUMN reports.extracted_company_name IS 'Clean company name extracted from domain';

-- Create indexes for performance on programmatic SEO queries
CREATE INDEX IF NOT EXISTS idx_reports_industry ON reports(industry) WHERE industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_public_industry ON reports(is_public, industry) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(state, city) WHERE state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_traffic_tier ON reports(monthly_traffic_tier) WHERE monthly_traffic_tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_company_size ON reports(company_size) WHERE company_size IS NOT NULL;

-- Create composite index for common query patterns (industry + public + sorting)
CREATE INDEX IF NOT EXISTS idx_reports_industry_revenue ON reports(industry, is_public, ((report_data->>'yearlyRevenueLost')::numeric)) 
  WHERE is_public = true AND industry IS NOT NULL;