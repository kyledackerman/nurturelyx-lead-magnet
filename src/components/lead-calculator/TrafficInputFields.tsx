
import { FormData } from "@/types/report";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { cleanDomain } from "@/services/api/spyfuConfig";

interface TrafficInputFieldsProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: string | number | boolean) => void;
  errors: { [key: string]: string };
  showTrafficFields: boolean;
}

export const TrafficInputFields = ({ formData, handleChange, errors, showTrafficFields }: TrafficInputFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="domain" className="block font-medium text-lg">
          Website URL
        </Label>
        <Input
          id="domain"
          type="text"
          placeholder="e.g., example.com"
          value={formData.domain}
          onChange={(e) => {
            const cleanedValue = cleanDomain(e.target.value);
            handleChange("domain", cleanedValue);
          }}
          className={`${errors.domain ? "border-red-300" : ""}`}
        />
        {errors.domain && (
          <p className="text-sm text-red-600 mt-1">{errors.domain}</p>
        )}
        <p className="text-xs text-gray-500 flex gap-1">
          <Info className="h-3 w-3 text-accent" />
          Enter your website domain without http:// or www (e.g., example.com)
        </p>
      </div>
      
      {/* Traffic fields have been completely removed */}
    </div>
  );
};
