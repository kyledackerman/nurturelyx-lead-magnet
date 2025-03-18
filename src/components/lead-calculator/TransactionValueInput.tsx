
import { AlertCircle, DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormData } from "@/types/report";

interface TransactionValueInputProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: string | number | boolean) => void;
  errors: { [key: string]: string };
}

export const TransactionValueInput = ({ formData, handleChange, errors }: TransactionValueInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="avgTransactionValue" className="text-lg">Average Transaction Value ($)</Label>
      <div className="relative max-w-[240px]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          id="avgTransactionValue"
          type="number"
          min="0"
          placeholder="0"
          value={formData.avgTransactionValue}
          onChange={(e) => handleChange("avgTransactionValue", parseInt(e.target.value) || 0)}
          className={`pl-10 ${errors.avgTransactionValue ? "border-red-300" : ""}`}
        />
        {errors.avgTransactionValue && (
          <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
            <AlertCircle className="h-4 w-4 mr-1" />
            <p>{errors.avgTransactionValue}</p>
          </div>
        )}
      </div>
      <div className="flex items-start gap-2 mt-2 bg-secondary/50 p-3 rounded-lg border border-border">
        <div className="bg-accent/10 p-2 rounded-full">
          <DollarSign className="h-6 w-6 text-accent" />
        </div>
        <p className="text-sm text-gray-400">
          <span className="font-medium text-gray-300">What is Average Transaction Value?</span> This is how much money your business makes from a typical sale. If you sell products, it's the average order value. If you provide services, it's your average contract or project value.
        </p>
      </div>
    </div>
  );
};
