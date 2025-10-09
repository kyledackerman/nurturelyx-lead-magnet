// Phase 1.2: Using generic TrendChartWithStats component
import TrendChartWithStats from "./TrendChartWithStats";

export const ProspectTrendChart = () => {
  return (
    <TrendChartWithStats
      title="Prospects Added (Last 30 Days)"
      tableName="prospect_activities"
      lineColor="#81e6d9"
      emptyMessage="No prospects added in the last 30 days"
    />
  );
};
