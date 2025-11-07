import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface KeyTakeawaysProps {
  takeaways: string[];
}

export const KeyTakeaways = ({ takeaways }: KeyTakeawaysProps) => {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <Card className="my-6 border-l-4 border-l-primary bg-primary/5 key-takeaways">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-primary" />
          Key Takeaways
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {takeaways.map((takeaway, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="text-primary font-semibold mt-0.5">•</span>
              <span className="flex-1">{takeaway}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
