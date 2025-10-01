
import { ApiData, MonthlyRevenueData, NewApiDataT } from "@/types/report";

export function formateNewApiDataToApiData(input: NewApiDataT): ApiData {
  // Find the latest month with non-zero traffic data
  let referenceMonth = null;
  for (let i = input.monthlyRevenueData.length - 1; i >= 0; i--) {
    const monthData = input.monthlyRevenueData[i];
    const totalTraffic = (monthData.monthlyOrganicClicks || 0) + (monthData.monthlyPaidClicks || 0);
    if (totalTraffic > 0 || monthData.totalOrganicResults > 0) {
      referenceMonth = monthData;
      console.log(`Using reference month: ${monthData.month}/${monthData.searchYear} with ${totalTraffic} total traffic`);
      break;
    }
  }

  // If all months are zeros, throw error
  if (!referenceMonth) {
    throw new Error("SpyFu returned no usable data for recent months. All traffic values are zero.");
  }

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
      // Use the reference month (latest non-zero) for headline metrics
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
