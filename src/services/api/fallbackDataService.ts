import { ApiData } from "@/types/report";

// Generate fallback data for domains when API fails
export const generateFallbackData = (
  domain: string,
  organicTrafficManual?: number
): ApiData => {
  // If user provided organic traffic, use it as base
  const baseTraffic =
    organicTrafficManual && organicTrafficManual > 0
      ? organicTrafficManual
      : Math.floor(1000 + domain.length * 200);

  // Generate reasonable fallback values based on domain length and provided traffic
  return {
    organicTraffic: baseTraffic,
    paidTraffic: Math.floor(baseTraffic * 0.3),
    organicKeywords: Math.floor(baseTraffic * 0.4),
    domainPower: Math.min(95, Math.floor(40 + domain.length * 1.5)),
    backlinks: Math.floor(baseTraffic * 0.5),
    dataSource: "fallback" as const,
  };
};
