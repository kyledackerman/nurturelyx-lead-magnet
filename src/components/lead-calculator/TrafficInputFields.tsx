
import { FormData } from "@/types/report";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface TrafficInputFieldsProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: string | number | boolean) => void;
  errors: { [key: string]: string };
}

export const TrafficInputFields = ({ formData, handleChange, errors }: TrafficInputFieldsProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Enter your traffic data manually</h3>
      
      {/* Paid Traffic Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="monthlyVisitors" className="text-base">
            Monthly Paid Search Traffic
          </Label>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="isUnsurePaid" 
              checked={formData.isUnsurePaid}
              onCheckedChange={(checked) => {
                // Explicitly convert to boolean
                handleChange("isUnsurePaid", checked === true);
              }}
            />
            <Label htmlFor="isUnsurePaid" className="text-sm cursor-pointer">
              I'm not sure
            </Label>
          </div>
        </div>
        
        <Input
          id="monthlyVisitors"
          type="number"
          min="0"
          placeholder="Enter your monthly paid traffic"
          value={formData.isUnsurePaid ? "" : formData.monthlyVisitors}
          onChange={(e) => handleChange("monthlyVisitors", Number(e.target.value))}
          disabled={formData.isUnsurePaid}
          className={`${errors.monthlyVisitors ? "border-red-300" : ""}`}
        />
        
        {errors.monthlyVisitors && (
          <div className="flex items-center text-sm text-red-600 mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            <p>{errors.monthlyVisitors}</p>
          </div>
        )}
        
        {formData.isUnsurePaid && (
          <p className="text-sm text-gray-500 italic">We'll estimate this based on your domain size</p>
        )}
      </div>
      
      {/* Organic Traffic Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="organicTrafficManual" className="text-base">
            Monthly Organic Search Traffic
          </Label>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="isUnsureOrganic" 
              checked={formData.isUnsureOrganic}
              onCheckedChange={(checked) => {
                // Explicitly convert to boolean
                handleChange("isUnsureOrganic", checked === true);
              }}
            />
            <Label htmlFor="isUnsureOrganic" className="text-sm cursor-pointer">
              I'm not sure
            </Label>
          </div>
        </div>
        
        <Input
          id="organicTrafficManual"
          type="number"
          min="0"
          placeholder="Enter your monthly organic traffic"
          value={formData.isUnsureOrganic ? "" : formData.organicTrafficManual}
          onChange={(e) => handleChange("organicTrafficManual", Number(e.target.value))}
          disabled={formData.isUnsureOrganic}
          className={`${errors.organicTrafficManual ? "border-red-300" : ""}`}
        />
        
        {errors.organicTrafficManual && (
          <div className="flex items-center text-sm text-red-600 mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            <p>{errors.organicTrafficManual}</p>
          </div>
        )}
        
        {formData.isUnsureOrganic && (
          <p className="text-sm text-gray-500 italic">We'll estimate this based on your domain size</p>
        )}
      </div>
    </div>
  );
};
