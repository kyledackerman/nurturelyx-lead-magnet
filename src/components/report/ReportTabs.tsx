import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DomainOverviewTab from "./DomainOverviewTab";
import SolutionTab from "./SolutionTab";
import { ReportData } from "@/types/report";

interface ReportTabsProps {
  data: ReportData;
}

const ReportTabs = ({ data }: ReportTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview" className="text-white">
          Domain Overview
        </TabsTrigger>
        <TabsTrigger value="solution" className="text-white">
          NurturelyX Solution
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="animate-fade-in">
        <DomainOverviewTab
          domain={data.domain}
          domainPower={data.domainPower}
          organicTraffic={data.organicTraffic}
          organicKeywords={data.organicKeywords}
          paidTraffic={data.paidTraffic || data.monthlyVisitors}
        />
      </TabsContent>

      <TabsContent value="solution" className="animate-fade-in">
        <SolutionTab
          missedLeads={data.missedLeads}
          estimatedSalesLost={data.estimatedSalesLost}
          monthlyRevenueLost={data.monthlyRevenueLost}
          yearlyRevenueLost={data.yearlyRevenueLost}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;
