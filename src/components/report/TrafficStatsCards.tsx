import { TrendingUp, Search, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TrafficStatsCardsProps {
  totalTraffic: number;
  organicTraffic: number;
  paidTraffic: number;
}

const TrafficStatsCards = ({
  totalTraffic,
  organicTraffic,
  paidTraffic,
}: TrafficStatsCardsProps) => {
  const organicPercent = totalTraffic > 0 ? Math.round((organicTraffic / totalTraffic) * 100) : 0;
  const paidPercent = totalTraffic > 0 ? Math.round((paidTraffic / totalTraffic) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      {/* Total Traffic - Hero Card */}
      <Card className="stat-card border-l-4 border-l-primary overflow-hidden bg-primary/10 p-6 hover:shadow-lg transition-all duration-300 md:col-span-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="stat-label text-primary text-sm font-bold uppercase tracking-wider mb-1">
              Total Monthly Traffic
            </p>
            <h3 className="stat-value text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2 text-primary">
              {totalTraffic.toLocaleString()}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              Combined organic + paid visitors
            </p>
          </div>
          <div className="bg-primary p-3 rounded-full text-primary-foreground shrink-0">
            <TrendingUp className="w-6 h-6 md:w-7 md:h-7" />
          </div>
        </div>
      </Card>

      {/* Organic Traffic */}
      <Card className="stat-card border-l-4 border-l-green-500 overflow-hidden bg-secondary p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="stat-label text-foreground text-sm font-bold uppercase tracking-wider mb-1">
              Organic Traffic
            </p>
            <h3 className="stat-value text-2xl sm:text-3xl md:text-4xl font-extrabold mt-2 text-green-500">
              {organicTraffic.toLocaleString()}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              {organicPercent}% of total traffic
            </p>
          </div>
          <div className="bg-green-500 p-3 rounded-full text-white shrink-0">
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </Card>

      {/* Paid Traffic */}
      <Card className="stat-card border-l-4 border-l-purple-500 overflow-hidden bg-secondary p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="stat-label text-foreground text-sm font-bold uppercase tracking-wider mb-1">
              Paid Traffic
            </p>
            <h3 className="stat-value text-2xl sm:text-3xl md:text-4xl font-extrabold mt-2 text-purple-500">
              {paidTraffic.toLocaleString()}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              {paidPercent}% of total traffic
            </p>
          </div>
          <div className="bg-purple-500 p-3 rounded-full text-white shrink-0">
            <Target className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrafficStatsCards;
