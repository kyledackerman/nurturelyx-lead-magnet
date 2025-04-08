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
    <Card className="stat-card border-l-4 border-l-accent overflow-hidden bg-secondary p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="stat-label text-white text-sm font-semibold uppercase tracking-wider">
            {label}
          </p>
          <h3 className="stat-value text-4xl md:text-5xl font-extrabold mt-2 text-accent">
            {value}
          </h3>
          <p
            className="mt-3 text-sm text-white font-medium"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        <div className="bg-accent p-3 rounded-full text-accent-foreground">
          <Icon size={28} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
