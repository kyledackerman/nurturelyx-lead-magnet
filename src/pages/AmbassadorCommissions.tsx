import { useQuery } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AmbassadorCommissions() {
  const { data: commissions, isLoading } = useQuery({
    queryKey: ['my-commissions'],
    queryFn: () => ambassadorService.getMyCommissions(),
  });

  const { data: stats } = useQuery({
    queryKey: ['ambassador-stats'],
    queryFn: () => ambassadorService.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const totalPending = commissions?.filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

  const totalEligible = commissions?.filter(c => c.status === 'eligible')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

  const totalPaid = commissions?.filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commissions & Payouts</h1>
        <p className="text-muted-foreground">Track your earnings and payout history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">In 60-day hold period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalEligible.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalEligible >= 100 ? 'Ready for payout' : `Need $${(100 - totalEligible).toFixed(2)} more`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earnings received</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requirements</CardTitle>
          <CardDescription>
            Commissions must meet these requirements before payout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">60-Day Hold</Badge>
            <span className="text-muted-foreground">
              Platform fee commissions are held for 60 days after first lead delivery
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">$100 Minimum</Badge>
            <span className="text-muted-foreground">
              You must have at least $100 in eligible commissions to receive a payout
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">Monthly Processing</Badge>
            <span className="text-muted-foreground">
              Payouts are processed monthly by the admin team
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>All your commission records</CardDescription>
        </CardHeader>
        <CardContent>
          {commissions && commissions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No commissions yet. Start converting domains to earn!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Base Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Eligible Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions?.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      {new Date(commission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{commission.domain}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {commission.commission_type === 'platform_fee' ? 'Platform Fee' : 'Per-Lead'}
                      </Badge>
                    </TableCell>
                    <TableCell>${Number(commission.base_amount).toFixed(2)}</TableCell>
                    <TableCell>{Number(commission.commission_rate).toFixed(1)}%</TableCell>
                    <TableCell className="font-semibold">
                      ${Number(commission.commission_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        commission.status === 'paid' ? 'default' :
                        commission.status === 'eligible' ? 'secondary' :
                        'outline'
                      }>
                        {commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {commission.eligible_for_payout_at
                        ? new Date(commission.eligible_for_payout_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
