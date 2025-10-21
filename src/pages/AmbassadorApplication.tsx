import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { NewProgramBanner } from "@/components/ambassador/NewProgramBanner";
import { IncomeCalculator } from "@/components/ambassador/IncomeCalculator";
import { IncomeScenarioCards } from "@/components/ambassador/IncomeScenarioCards";
import { BenefitsGrid } from "@/components/ambassador/BenefitsGrid";
import { AmbassadorFAQ } from "@/components/ambassador/AmbassadorFAQ";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function AmbassadorApplication() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    how_heard: "",
    sales_experience: "",
    your_network: "",
    why_join: "",
  });

  const submitMutation = useMutation({
    mutationFn: (data: typeof formData) => ambassadorService.submitApplication(data),
    onSuccess: () => {
      toast.success("Application submitted successfully! Check your email for next steps.");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        linkedin_url: "",
        how_heard: "",
        sales_experience: "",
        your_network: "",
        why_join: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <NewProgramBanner />

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Turn Your Business Network Into <span className="text-primary">Recurring Income</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Be one of the first ambassadors. Earn $30-$50/month per client + per-lead commissions. 
            Growth tiers unlock at 100 and 1,000 referrals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" onClick={scrollToForm} className="text-lg">
              Apply Now (2 Minutes) <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToCalculator} className="text-lg">
              Calculate Your Potential
            </Button>
          </div>
        </div>

        <div id="calculator" className="mb-20">
          <IncomeCalculator />
        </div>

        <div className="mb-20">
          <IncomeScenarioCards />
        </div>

        {/* How It Works - simplified for space */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Apply", desc: "2 minute application" },
              { step: "2", title: "Get Trained", desc: "Free onboarding" },
              { step: "3", title: "Refer & Earn", desc: "$30/mo per client" },
              { step: "4", title: "Scale", desc: "Unlock higher rates" },
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <BenefitsGrid />
        </div>

        <div className="mb-20">
          <AmbassadorFAQ />
        </div>

        {/* Application Form */}
        <div id="application-form" className="mb-20">
          <Card className="max-w-3xl mx-auto border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">Apply to Become an Ambassador</CardTitle>
              <CardDescription>Complete in 2 minutes. 24-48 hour review.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="your_network">Your Network *</Label>
                  <Textarea id="your_network" required placeholder="What types of businesses do you have access to?" rows={4} value={formData.your_network} onChange={(e) => setFormData({ ...formData, your_network: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="why_join">Why Join? *</Label>
                  <Textarea id="why_join" required rows={4} value={formData.why_join} onChange={(e) => setFormData({ ...formData, why_join: e.target.value })} />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
