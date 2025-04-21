
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

const StatCard = ({ label, value, description, icon: Icon }: StatCardProps) => {
  return (
    <Card className="stat-card border-l-4 border-l-accent overflow-hidden bg-secondary p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="stat-label text-white text-sm font-bold uppercase tracking-wider mb-1">
            {label}
          </p>
          <h3 className="stat-value text-5xl md:text-6xl font-extrabold mt-2 text-accent">
            {value}
          </h3>
          <p
            className="mt-3 text-sm text-white font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        <div className="bg-accent p-3 rounded-full text-accent-foreground shrink-0">
          <Icon size={28} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
