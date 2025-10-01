import { ApiData, NewApiDataT, ReportData } from "@/types/report";
import { isValidDomain, cleanDomain, SPYFU_API_USERNAME, SPYFU_API_KEY } from "./spyfuConfig";
import { generateFallbackData } from "./fallbackDataService";
import { formateNewApiDataToApiData } from "@/utils";


// Function to fetch domain data from SpyFu API via proxy
export const fetchDomainData = async (
  domain: string,
  organicTrafficManual?: number,
  isUnsureOrganic?: boolean
): Promise<ApiData> => {
  console.log(`Analyzing domain: ${domain}...`);

  try {
    // Clean domain format
    const cleanedDomain = cleanDomain(domain);

    if (!isValidDomain(cleanedDomain)) {
      throw new Error("Please enter a valid domain (e.g., example.com)");
    }

    console.log(`Analyzing domain: ${cleanedDomain}`);

    // If user provided manual traffic and isn't unsure, use it without API call
    // if (
    //   organicTrafficManual !== undefined &&
    //   !isUnsureOrganic &&
    //   organicTrafficManual > 0
    // ) {
    //   toast.success(`Using your manually entered data for ${domain}`, {
    //     id: toastId,
    //   });

    //   return {
    //     organicKeywords: Math.floor(organicTrafficManual * 0.3),
    //     organicTraffic: organicTrafficManual,
    //     paidTraffic: 0,
    //     domainPower: Math.min(95, Math.floor(40 + domain.length * 2)),
    //     backlinks: Math.floor(organicTrafficManual * 0.5),
    //     dataSource: "manual" as const,
    //   };
    // }

    // Try to get real data directly from SpyFu "Get All Domain Stats" endpoint
    try {
      const spyfuUrl = `https://www.spyfu.com/apis/domain_stats_api/v2/getAllDomainStats?domain=${encodeURIComponent(cleanedDomain)}&countryCode=US&api_username=${encodeURIComponent(SPYFU_API_USERNAME)}&api_key=${encodeURIComponent(SPYFU_API_KEY)}`;
      console.log(`Fetching SpyFu series: ${spyfuUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(spyfuUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        signal: controller.signal,
        cache: "no-store",
        mode: "cors",
        credentials: "omit",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("SpyFu API response error:", response.status, response.statusText);
        throw new Error(`SpyFu API returned status ${response.status}`);
      }

      const raw: any = await response.json();

      // Normalize possible response shapes to an array of monthly rows
      const rawRows: any[] = Array.isArray(raw)
        ? raw
        : (raw?.data || raw?.domainStats || raw?.stats || raw?.results || raw?.rows || []);

      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        throw new Error("SpyFu returned no rows");
      }

      const monthMap: Record<string, number> = {
        jan: 1, january: 1,
        feb: 2, february: 2,
        mar: 3, march: 3,
        apr: 4, april: 4,
        may: 5,
        jun: 6, june: 6,
        jul: 7, july: 7,
        aug: 8, august: 8,
        sep: 9, sept: 9, september: 9,
        oct: 10, october: 10,
        nov: 11, november: 11,
        dec: 12, december: 12,
      };

      const toMonthNumber = (m: any): number => {
        if (typeof m === "number" && m >= 1 && m <= 12) return m;
        if (typeof m === "string") {
          const key = m.trim().toLowerCase();
          if (monthMap[key] != null) return monthMap[key];
          const parsed = parseInt(key, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) return parsed;
        }
        return 0;
      };

      const monthly = rawRows.map((r: any) => {
        const monthNum =
          toMonthNumber(r.month ?? r.Month ?? r.searchMonth ?? r.search_date_month ?? r.searchMonthNumber);
        const year =
          r.searchYear ?? r.Year ?? r.search_date_year ?? r.year ?? new Date().getFullYear();
        const organic =
          r.monthlyOrganicClicks ?? r.organicClicks ?? r.organic ?? r.organic_traffic ?? 0;
        const paid =
          r.monthlyPaidClicks ?? r.paidClicks ?? r.paid ?? r.paid_traffic ?? 0;
        const totalOrganicResults =
          r.totalOrganicResults ?? r.organicKeywords ?? r.keywords ?? 0;
        const strength = r.strength ?? r.domainStrength ?? r.domainPower ?? 0;

        return {
          month: monthNum,
          searchYear: year,
          monthlyOrganicClicks: Math.max(0, Math.floor(organic)),
          monthlyPaidClicks: Math.max(0, Math.floor(paid)),
          totalOrganicResults: Math.max(0, Math.floor(totalOrganicResults)),
          strength: Math.max(0, Math.floor(strength)),
          totalAdsPurchased: 0,
        };
      }).filter((m: any) => m.month >= 1 && m.month <= 12);

      if (!monthly.length) {
        throw new Error("No valid monthly rows after normalization");
      }

      const NewData: NewApiDataT = {
        domain: cleanedDomain as any,
        dataSource: "api",
        monthlyRevenueData: monthly as any,
      };

      console.log(`SpyFu series normalized: ${monthly.length} months`);
      const apiData = formateNewApiDataToApiData(NewData);
      console.log("Analysis complete - using real SpyFu series data");

      return apiData;
    } catch (error: any) {
      console.warn("SpyFu series fetch failed:", error);

      if (organicTrafficManual !== undefined && organicTrafficManual > 0) {
        console.log("Using manual organic traffic input:", organicTrafficManual);
        return {
          organicKeywords: Math.floor(organicTrafficManual * 0.3),
          organicTraffic: organicTrafficManual,
          paidTraffic: 0,
          domainPower: Math.min(95, Math.floor(40 + domain.length * 2)),
          backlinks: Math.floor(organicTrafficManual * 0.5),
          dataSource: "manual" as const,
          monthlyRevenueData: [],
        };
      }

      throw new Error(`Failed to fetch SpyFu data: ${error.message}`);
    }
  } catch (error: any) {
    console.error("Error in fetchDomainData:", error);

    // If user provided manual organic traffic, use it
    if (organicTrafficManual !== undefined && organicTrafficManual > 0) {
      console.log("Using manual organic traffic input:", organicTrafficManual);
      return {
        organicKeywords: Math.floor(organicTrafficManual * 0.3),
        organicTraffic: organicTrafficManual,
        paidTraffic: 0,
        domainPower: Math.min(95, Math.floor(40 + domain.length * 2)),
        backlinks: Math.floor(organicTrafficManual * 0.5),
        dataSource: "manual" as const,
        monthlyRevenueData: [],
      };
    }

    // No synthetic fallback - throw the error
    throw error;
  }
};
