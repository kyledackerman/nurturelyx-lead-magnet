-- Add facebook_scraping_enabled column to enrichment_settings
ALTER TABLE enrichment_settings 
ADD COLUMN IF NOT EXISTS facebook_scraping_enabled BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN enrichment_settings.facebook_scraping_enabled IS 
'Enable/disable Facebook page scraping during enrichment. Default is false to avoid rate limits and blocking.';