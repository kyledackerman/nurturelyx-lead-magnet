import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, Award, DollarSign, TrendingUp } from "lucide-react";
import Header from "@/components/Header";

export default function AmbassadorApplication() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    sales_experience: '',
    why_join: '',
  });

  const submitMutation = useMutation({
    mutationFn: (data: typeof formData) => ambassadorService.submitApplication(data),
    onSuccess: () => {
      toast.success('Application submitted successfully! We\'ll review it shortly.');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        linkedin_url: '',
        sales_experience: '',
        why_join: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Become an Ambassador</h1>
        <p className="text-xl text-muted-foreground">
          Help businesses identify their website visitors and earn generous commissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center">
            <Award className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle>Two-Tier Earnings</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Earn from monthly platform fees (30-50%) AND per-lead commissions (5-15%)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle>Low Entry Cost</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Purchase marketplace leads for just $0.05 or submit new domains for free
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle>Growth Tiers</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Higher commission rates as you scale: Bronze → Silver → Gold
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>
            Tell us about yourself and why you'd be a great ambassador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_experience">Sales Experience</Label>
              <Textarea
                id="sales_experience"
                placeholder="Tell us about your sales background, relevant experience, or skills..."
                rows={4}
                value={formData.sales_experience}
                onChange={(e) => setFormData({ ...formData, sales_experience: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why_join">Why do you want to join our ambassador program? *</Label>
              <Textarea
                id="why_join"
                required
                placeholder="What interests you about this opportunity? What makes you a good fit?"
                rows={4}
                value={formData.why_join}
                onChange={(e) => setFormData({ ...formData, why_join: e.target.value })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What You'll Get</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Access to Lead Marketplace</div>
              <p className="text-sm text-muted-foreground">
                Purchase qualified leads for just $0.05 each
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Free Domain Submissions</div>
              <p className="text-sm text-muted-foreground">
                Submit new domains and get them assigned to you automatically
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Recurring Commissions</div>
              <p className="text-sm text-muted-foreground">
                Earn monthly from platform fees and per-lead processing
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Tier-Based Growth</div>
              <p className="text-sm text-muted-foreground">
                Increase your commission rates as you scale your portfolio
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Sales Resources</div>
              <p className="text-sm text-muted-foreground">
                Get access to templates, scripts, and training materials
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
