import { ApiData, NewApiDataT, ReportData } from "@/types/report";
import { isValidDomain, cleanDomain } from "./spyfuConfig";
import { generateFallbackData } from "./fallbackDataService";
import { formateNewApiDataToApiData } from "@/utils";
import { BASE_URL } from "@/envs";

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

    // Try to get real data from the SpyFu API via our proxy
    try {
      // Use relative path for API and ensure no caching
      const proxyUrl = `${BASE_URL}/proxy/spyfu?domain=${encodeURIComponent(
        cleanedDomain
      )}`;
      console.log(`Fetching real data via relative path: ${proxyUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(proxyUrl, {
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
        console.error(
          "❌ API response error:",
          response.status,
          response.statusText
        );
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      console.log("📥 Received response, parsing...");

      // Get response text first to avoid "body stream already read" errors
      let responseText;
      try {
        responseText = await response.text();
        console.log("📄 Response text length:", responseText.length);
      } catch (textError) {
        console.error("❌ Failed to read response text:", textError);
        throw new Error("Failed to read server response. Please try again.");
      }

      // Check if response contains HTML markers
      if (
        responseText.includes("<!DOCTYPE") ||
        responseText.includes("<html")
      ) {
        console.error("❌ Server returned HTML instead of JSON");
        throw new Error(
          "Server configuration error. Please contact support."
        );
      }

      // Check if response is empty
      if (!responseText || responseText.trim() === "") {
        console.error("❌ Empty response from API server");
        throw new Error("Empty response from server. Please try again.");
      }

      let data;
      try {
        // Parse the response text as JSON
        data = JSON.parse(responseText);
        console.log("✅ Successfully parsed JSON response");
        console.log("📊 Response data keys:", Object.keys(data));
      } catch (jsonError) {
        console.error("❌ Error parsing API response:", jsonError);
        console.error("Response preview:", responseText.substring(0, 200));

        throw new Error("Invalid response format from server. Please try again.");
      }

      // Check if data contains error
      if (data?.error) {
        console.error("❌ API returned error:", data.error);
        throw new Error(data.error);
      }

      // Validate that we have the expected data structure
      if (!data || typeof data !== 'object') {
        console.error("❌ Invalid data structure received");
        throw new Error("Invalid data received from SpyFu API. Please try again.");
      }

      const NewData = data as NewApiDataT;

      // Extract the relevant metrics from the API response
      console.log("📊 Raw API data:", data);
      const apiData = formateNewApiDataToApiData(NewData);

      console.log("✅ Analysis complete - using REAL SpyFu data");
      console.log("📈 Organic Traffic:", apiData.organicTraffic);
      console.log("🔑 Organic Keywords:", apiData.organicKeywords);
      console.log("💰 Paid Traffic:", apiData.paidTraffic);

      return apiData;
    } catch (error: any) {
      console.error("❌ API data fetch failed:", error.message);

      // If there's manual traffic data available, use it
      if (organicTrafficManual !== undefined && organicTrafficManual > 0) {
        console.log("✅ Using manual traffic data (user-provided)");

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

      // NO FALLBACK DATA - Force user to enter manual data
      console.error("❌ No manual data provided. User must enter traffic data manually.");
      throw new Error(
        `Unable to retrieve SpyFu data for ${cleanedDomain}. Please enter your organic traffic manually to continue.`
      );
    }
  } catch (error: any) {
    console.error(`❌ Error fetching domain data:`, error);

    // If user provided manual data, use it
    if (organicTrafficManual !== undefined && organicTrafficManual > 0) {
      console.log("✅ Using manual traffic data (user-provided after error)");

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

    // NO FALLBACK DATA - Force user to enter manual data
    const errorMessage =
      error instanceof Error
        ? error.message
        : `Unable to retrieve data for ${domain}. Please enter your organic traffic manually to continue.`;

    console.error(`❌ Failed to analyze ${domain}:`, errorMessage);

    throw new Error(errorMessage);
  }
};
