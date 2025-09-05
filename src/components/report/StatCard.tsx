
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

const StatCard = ({ label, value, icon: Icon }: StatCardProps) => {
  return (
    <Card className="stat-card border-l-4 border-l-accent overflow-hidden bg-secondary p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="stat-label text-white text-sm font-bold uppercase tracking-wider mb-1">
            {label}
          </p>
          <h3 className="stat-value text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mt-2 text-accent">
            {value}
          </h3>
        </div>
        <div className="bg-accent p-3 rounded-full text-accent-foreground shrink-0">
          <Icon size={28} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
