import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { SalesCallInputs } from "@/types/salesCall";

interface SalesCallFormProps {
  onCalculate: (inputs: SalesCallInputs) => void;
}

export const SalesCallForm = ({ onCalculate }: SalesCallFormProps) => {
  const [callsPerPeriod, setCallsPerPeriod] = useState<string>("50");
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>("day");
  const [avgCallDuration, setAvgCallDuration] = useState<string>("15");
  const [hourlyRate, setHourlyRate] = useState<string>("50");
  const [conversionRate, setConversionRate] = useState<string>("5");
  const [avgDealValue, setAvgDealValue] = useState<string>("5000");
  const [numberOfReps, setNumberOfReps] = useState<string>("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const inputs: SalesCallInputs = {
      callsPerPeriod: parseFloat(callsPerPeriod) || 0,
      period,
      avgCallDuration: parseFloat(avgCallDuration) || 0,
      hourlyRate: parseFloat(hourlyRate) || 0,
      conversionRate: parseFloat(conversionRate) || 0,
      avgDealValue: parseFloat(avgDealValue) || 0,
      numberOfReps: parseInt(numberOfReps) || 1
    };

    onCalculate(inputs);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Sales Call ROI Calculator
        </CardTitle>
        <CardDescription>
          Calculate the true cost and return on investment of your sales calling efforts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="calls">Number of Sales Calls</Label>
              <div className="flex gap-2">
                <Input
                  id="calls"
                  type="number"
                  min="1"
                  value={callsPerPeriod}
                  onChange={(e) => setCallsPerPeriod(e.target.value)}
                  placeholder="50"
                  required
                  className="flex-1"
                />
                <Select value={period} onValueChange={(value: 'day' | 'week' | 'month') => setPeriod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">per day</SelectItem>
                    <SelectItem value="week">per week</SelectItem>
                    <SelectItem value="month">per month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Average Call Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="180"
                value={avgCallDuration}
                onChange={(e) => setAvgCallDuration(e.target.value)}
                placeholder="15"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Sales Rep Hourly Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                min="1"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversion">Conversion Rate (%)</Label>
              <Input
                id="conversion"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                placeholder="5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealValue">Average Deal Value ($)</Label>
              <Input
                id="dealValue"
                type="number"
                min="1"
                step="0.01"
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(e.target.value)}
                placeholder="5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Number of Sales Reps</Label>
              <Input
                id="reps"
                type="number"
                min="1"
                value={numberOfReps}
                onChange={(e) => setNumberOfReps(e.target.value)}
                placeholder="1"
                required
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Calculate ROI
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
