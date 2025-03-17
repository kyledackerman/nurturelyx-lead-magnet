
import { FormData } from "@/types/report";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InfoCircle } from "lucide-react";

interface TrafficInputFieldsProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: string | number | boolean) => void;
  errors: { [key: string]: string };
}

export const TrafficInputFields = ({ formData, handleChange, errors }: TrafficInputFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="monthlyVisitors" className="block font-medium">
          Monthly Paid Traffic
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <Input
              id="monthlyVisitors"
              type="number"
              placeholder="e.g., 1000"
              value={formData.monthlyVisitors}
              onChange={(e) => handleChange("monthlyVisitors", Number(e.target.value))}
              min="0"
              className={`${errors.monthlyVisitors ? "border-red-300" : ""}`}
              disabled={formData.isUnsurePaid}
            />
            {errors.monthlyVisitors && (
              <p className="text-sm text-red-600 mt-1">{errors.monthlyVisitors}</p>
            )}
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <Checkbox 
              id="isUnsurePaid" 
              checked={formData.isUnsurePaid}
              onCheckedChange={(checked) => handleChange("isUnsurePaid", checked === true)}
              className="mr-2 h-4 w-4" 
            />
            <Label htmlFor="isUnsurePaid" className="text-sm text-gray-500 cursor-pointer">
              I'm not sure about my paid traffic
            </Label>
          </div>
        </div>
        <p className="text-xs text-gray-500 flex gap-1">
          <InfoCircle className="h-3 w-3 text-accent" />
          Traffic from paid ads (Google Ads, social media, etc.)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organicTrafficManual" className="block font-medium">
          Monthly Organic Traffic 
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <Input
              id="organicTrafficManual"
              type="number"
              placeholder="e.g., 5000"
              value={formData.organicTrafficManual}
              onChange={(e) => handleChange("organicTrafficManual", Number(e.target.value))}
              min="0"
              className={`${errors.organicTrafficManual ? "border-red-300" : ""}`}
              disabled={formData.isUnsureOrganic}
            />
            {errors.organicTrafficManual && (
              <p className="text-sm text-red-600 mt-1">{errors.organicTrafficManual}</p>
            )}
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <Checkbox 
              id="isUnsureOrganic" 
              checked={formData.isUnsureOrganic}
              onCheckedChange={(checked) => handleChange("isUnsureOrganic", checked === true)}
              className="mr-2 h-4 w-4" 
            />
            <Label htmlFor="isUnsureOrganic" className="text-sm text-gray-500 cursor-pointer">
              I'm not sure about my organic traffic
            </Label>
          </div>
        </div>
        <p className="text-xs text-gray-500 flex gap-1">
          <InfoCircle className="h-3 w-3 text-accent" />
          Traffic from search engines (unpaid/SEO)
        </p>
      </div>
    </div>
  );
};
