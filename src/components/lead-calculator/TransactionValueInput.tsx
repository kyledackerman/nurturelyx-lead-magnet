
import { FormData } from "@/types/report";
import { Input } from "@/components/ui/input";
import { formatCurrency, parseToNumber } from "@/lib/utils";
import { DollarSign } from "lucide-react";

interface TransactionValueInputProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: string | number | boolean) => void;
  errors: { [key: string]: string };
}

export const TransactionValueInput = ({
  formData,
  handleChange,
  errors,
}: TransactionValueInputProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numberValue = parseToNumber(e.target.value);
    handleChange("avgTransactionValue", numberValue);
  };

  return (
    <div className="mb-6 mt-8">
      <label htmlFor="transaction-value" className="block mb-2 text-sm font-medium text-gray-900">
        What is your average transaction value?
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <DollarSign className="h-5 w-5 text-gray-500" />
        </div>
        <Input
          type="text"
          id="transaction-value"
          className={`pl-10 ${errors.avgTransactionValue ? "border-red-500" : ""}`}
          value={formData.avgTransactionValue ? formatCurrency(formData.avgTransactionValue) : ""}
          onChange={handleValueChange}
          placeholder="0.00"
        />
      </div>
      {errors.avgTransactionValue && (
        <p className="mt-1 text-sm text-red-500">{errors.avgTransactionValue}</p>
      )}
      <p className="text-xs text-gray-500 mt-2 mb-4">
        Enter the average value of a transaction or sale for your business.
      </p>
    </div>
  );
};
