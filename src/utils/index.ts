import { ApiData, MonthlyRevenueData, NewApiDataT } from "@/types/report";

export function formateNewApiDataToApiData(input: NewApiDataT): ApiData {
  const aggregatedData = input.monthlyRevenueData.reduce(
    (acc, monthData) => {
      // const totalTraffic =
      //   (monthData.monthlyOrganicClicks || 0) +
      //   (monthData.monthlyPaidClicks || 0);
      // const missedLeads = Math.floor(totalTraffic * visitorIdentificationRate);
      // const estimatedSalesLost = Math.floor(missedLeads * salesConversionRate);
      // const monthlyRevenueLost = estimatedSalesLost * avgTransactionValue;

      acc.organicTraffic = monthData.monthlyOrganicClicks || 0;
      acc.paidTraffic = monthData.monthlyPaidClicks || 0;
      acc.organicKeywords = monthData.totalOrganicResults || 0;
      acc.domainPower = monthData.strength || 0; // Summing strength (adjust logic if needed)
      acc.backlinks = 0; // Mocking backlinks (adjust based on requirements)

      acc.monthlyRevenueData.push({
        month: monthData.month,
        year: monthData.searchYear,
        visitors: monthData.monthlyOrganicClicks + monthData.monthlyPaidClicks,
        organicVisitors: monthData.monthlyOrganicClicks,
        paidVisitors: monthData.monthlyPaidClicks,
        leads: monthData.totalAdsPurchased, // missedLeads
        sales: 0, // estimatedSalesLost
        revenueLost: 0, // monthlyRevenueLost
      });

      return acc;
    },
    {
      organicTraffic: 0,
      organicKeywords: 0,
      domainPower: 0,
      backlinks: 0,
      paidTraffic: 0,
      dataSource: input.dataSource, // Copy dataSource directly
      monthlyRevenueData: [] as MonthlyRevenueData[],
    }
  );

  // Averaging domainPower (optional logic)
  if (input.monthlyRevenueData.length > 0) {
    aggregatedData.domainPower /= input.monthlyRevenueData.length;
  }

  return aggregatedData;
}
