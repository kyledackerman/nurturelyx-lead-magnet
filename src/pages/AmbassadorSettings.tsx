import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AmbassadorSettings() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['ambassador-stats'],
    queryFn: () => ambassadorService.getDashboardStats(),
  });

  const profile = stats?.profile;

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    payment_method: profile?.payment_method || '',
    payment_details: '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => ambassadorService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['ambassador-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings & Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and payment settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
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

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Configure how you'd like to receive your commission payouts ($100 minimum)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check (Mailed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_method === 'paypal' && (
            <div className="space-y-2">
              <Label htmlFor="payment_details">PayPal Email</Label>
              <Input
                id="payment_details"
                type="email"
                placeholder="your@email.com"
                value={formData.payment_details}
                onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
              />
            </div>
          )}

          {formData.payment_method === 'venmo' && (
            <div className="space-y-2">
              <Label htmlFor="payment_details">Venmo Username</Label>
              <Input
                id="payment_details"
                placeholder="@username"
                value={formData.payment_details}
                onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
              />
            </div>
          )}

          {formData.payment_method === 'bank_transfer' && (
            <div className="space-y-2">
              <Label htmlFor="payment_details">Bank Account Details</Label>
              <Input
                id="payment_details"
                placeholder="Account number and routing number"
                value={formData.payment_details}
                onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                We'll contact you separately for full bank details
              </p>
            </div>
          )}

          {formData.payment_method === 'check' && (
            <div className="space-y-2">
              <Label htmlFor="payment_details">Mailing Address</Label>
              <Input
                id="payment_details"
                placeholder="Street address, City, State, ZIP"
                value={formData.payment_details}
                onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
              />
            </div>
          )}

          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Payment Info'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Account Status</span>
              <span className="font-semibold">{profile?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="font-semibold">
                {stats?.profile?.created_at 
                  ? new Date(stats.profile.created_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
