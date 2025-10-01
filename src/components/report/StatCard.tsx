
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  isHighValue?: boolean;
}

const StatCard = ({ label, value, icon: Icon, isHighValue = false }: StatCardProps) => {
  return (
    <Card className={isHighValue 
      ? "stat-card border-l-4 border-l-orange-600 overflow-hidden bg-orange-50 p-6 hover:shadow-lg transition-all duration-300"
      : "stat-card border-l-4 border-l-accent overflow-hidden bg-secondary p-6 hover:shadow-lg transition-all duration-300"
    }>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className={isHighValue 
            ? "stat-label text-orange-800 text-sm font-bold uppercase tracking-wider mb-1"
            : "stat-label text-white text-sm font-bold uppercase tracking-wider mb-1"
          }>
            {label}
          </p>
          <h3 className={isHighValue
            ? "stat-value text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-extrabold mt-2 text-orange-700"
            : "stat-value text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-extrabold mt-2 text-accent"
          }>
            {value}
          </h3>
        </div>
        <div className={isHighValue
          ? "bg-orange-600 p-2 sm:p-3 rounded-full text-white shrink-0"
          : "bg-accent p-2 sm:p-3 rounded-full text-accent-foreground shrink-0"
        }>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
