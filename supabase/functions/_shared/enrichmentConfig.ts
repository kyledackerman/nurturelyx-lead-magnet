/**
 * Centralized configuration for enrichment processes
 */
export const ENRICHMENT_CONFIG = {
  /**
   * Maximum number of contacts to store per domain
   * Prevents database bloat from domains with excessive contact lists
   */
  MAX_CONTACTS_PER_DOMAIN: 25,
};
