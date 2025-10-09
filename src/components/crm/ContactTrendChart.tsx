// Phase 1.2: Using generic TrendChartWithStats component
import TrendChartWithStats from "./TrendChartWithStats";

export const ContactTrendChart = () => {
  return (
    <TrendChartWithStats
      title="Contacts Added (Last 30 Days)"
      tableName="prospect_contacts"
      lineColor="#c084fc"
      emptyMessage="No contacts added in the last 30 days"
    />
  );
};
