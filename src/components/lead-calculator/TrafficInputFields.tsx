
import { AlertCircle, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormData } from "@/types/report";

interface TrafficInputFieldsProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: string | number | boolean) => void;
  errors: { [key: string]: string };
}

export const TrafficInputFields = ({ formData, handleChange, errors }: TrafficInputFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <div>
          <Label htmlFor="organicTrafficManual" className="text-lg">Monthly Organic Visitors</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox 
              id="isUnsureOrganic" 
              checked={formData.isUnsureOrganic}
              onCheckedChange={(checked) => {
                // Convert the checked value to a boolean explicitly
                handleChange("isUnsureOrganic", checked === true);
              }}
            />
            <label htmlFor="isUnsureOrganic" className="text-sm text-gray-400 cursor-pointer">
              I'm not sure (we'll try to fetch this data for you)
            </label>
          </div>
        </div>
        
        <Input
          id="organicTrafficManual"
          type="number"
          min="0"
          placeholder="0"
          value={formData.isUnsureOrganic ? "" : formData.organicTrafficManual}
          onChange={(e) => handleChange("organicTrafficManual", parseInt(e.target.value) || 0)}
          className={errors.organicTrafficManual ? "border-red-300" : ""}
          disabled={formData.isUnsureOrganic}
        />
        {errors.organicTrafficManual ? (
          <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
            <AlertCircle className="h-4 w-4 mr-1" />
            <p>{errors.organicTrafficManual}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1 text-accent" />
            This is your estimated monthly organic search traffic
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <div>
          <Label htmlFor="monthlyVisitors" className="text-lg">Monthly Paid Visitors</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox 
              id="isUnsurePaid" 
              checked={formData.isUnsurePaid}
              onCheckedChange={(checked) => {
                // Convert the checked value to a boolean explicitly
                handleChange("isUnsurePaid", checked === true);
              }}
            />
            <label htmlFor="isUnsurePaid" className="text-sm text-gray-400 cursor-pointer">
              I'm not sure (enter 0 if you don't run paid campaigns)
            </label>
          </div>
        </div>
        
        <Input
          id="monthlyVisitors"
          type="number"
          min="0"
          placeholder="1000"
          value={formData.isUnsurePaid ? "" : formData.monthlyVisitors}
          onChange={(e) => handleChange("monthlyVisitors", parseInt(e.target.value) || 0)}
          className={errors.monthlyVisitors ? "border-red-300" : ""}
          disabled={formData.isUnsurePaid}
        />
        {errors.monthlyVisitors ? (
          <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
            <AlertCircle className="h-4 w-4 mr-1" />
            <p>{errors.monthlyVisitors}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1 text-accent" />
            This is your estimated monthly paid traffic from all sources
          </p>
        )}
      </div>
    </>
  );
};
