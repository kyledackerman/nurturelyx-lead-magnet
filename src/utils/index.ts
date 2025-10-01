
import { ApiData, MonthlyRevenueData, NewApiDataT } from "@/types/report";

export function formateNewApiDataToApiData(input: NewApiDataT): ApiData {
  // Find the most recent month by (searchYear, searchMonth) - no "latest non-zero" logic
  let referenceMonth = input.monthlyRevenueData[input.monthlyRevenueData.length - 1];
  
  if (!referenceMonth) {
    throw new Error("SpyFu returned no monthly data");
  }

  console.log(`Using reference month: ${referenceMonth.month}/${referenceMonth.searchYear} (most recent)`);

  const aggregatedData = input.monthlyRevenueData.reduce(
    (acc, monthData) => {
      acc.monthlyRevenueData.push({
        month: monthData.month,
        year: monthData.searchYear,
        visitors: monthData.monthlyOrganicClicks + monthData.monthlyPaidClicks,
        organicVisitors: monthData.monthlyOrganicClicks,
        paidVisitors: monthData.monthlyPaidClicks,
        leads: monthData.totalAdsPurchased,
        missedLeads: monthData.totalAdsPurchased,
        sales: 0,
        lostSales: 0,
        revenueLost: 0,
        lostRevenue: 0
      });

      return acc;
    },
    {
      // Use the most recent month for headline metrics (even if zeros)
      organicTraffic: referenceMonth.monthlyOrganicClicks || 0,
      paidTraffic: referenceMonth.monthlyPaidClicks || 0,
      organicKeywords: referenceMonth.totalOrganicResults || 0,
      domainPower: referenceMonth.strength || 0,
      backlinks: 0,
      dataSource: input.dataSource,
      monthlyRevenueData: [] as MonthlyRevenueData[],
    }
  );

  return aggregatedData;
}
