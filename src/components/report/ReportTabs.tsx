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
        <TabsTrigger value="overview">
          Domain Overview
        </TabsTrigger>
        <TabsTrigger value="solution">
          NurturelyX Solution
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="animate-fade-in">
        <DomainOverviewTab
          domain={data.domain}
          domainPower={data.domainPower ?? 0}
          organicTraffic={data.organicTraffic ?? 0}
          organicKeywords={data.organicKeywords ?? 0}
          paidTraffic={data.paidTraffic ?? data.monthlyVisitors ?? 0}
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
