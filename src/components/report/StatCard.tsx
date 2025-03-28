
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
          <p className="stat-label text-white text-sm">{label}</p>
          <h3 className="stat-value text-3xl font-bold mt-1">{value}</h3>
          <p 
            className="mt-2 text-sm text-white"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        <div className="bg-accent p-3 rounded-full text-accent-foreground">
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
