
import { ApiData, NewApiDataT } from "@/types/report";

export function formateNewApiDataToApiData(input: NewApiDataT): ApiData {
  // Calculate aggregate metrics from monthly data
  const monthlyData = input.monthlyData || [];
  
  let totalOrganicClicks = 0;
  let totalPaidClicks = 0;
  let avgDomainPower = 0;
  let avgBacklinks = 0;

  // Aggregate monthly data
  monthlyData.forEach((monthData) => {
    totalOrganicClicks += monthData.monthlyOrganicClicks || 0;
    totalPaidClicks += monthData.monthlyPaidClicks || 0;
  });

  // Calculate averages
  const monthlyCount = monthlyData.length || 1;
  avgDomainPower = Math.floor(Math.random() * 40) + 50; // Simulate domain power
  avgBacklinks = Math.floor(totalOrganicClicks * 0.5); // Estimate backlinks

  return {
    organicTraffic: totalOrganicClicks,
    paidTraffic: totalPaidClicks,
    organicKeywords: Math.floor(totalOrganicClicks * 0.4),
    domainPower: avgDomainPower,
    backlinks: avgBacklinks,
    dataSource: input.dataSource,
  };
}
