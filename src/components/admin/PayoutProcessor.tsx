import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DollarSign, Calendar, Check, Loader2, Eye, PlayCircle } from "lucide-react";

interface PayoutBatch {
  id: string;
  batch_name: string;
  batch_number: number;
  payout_period_start: string;
  payout_period_end: string;
  total_ambassadors: number;
  total_commissions_count: number;
  total_commission_amount: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  processed_by: string;
}

interface PreviewAmbassador {
  ambassador_id: string;
  ambassador_name: string;
  ambassador_email: string;
  commission_count: number;
  total_amount: number;
  commissions: any[];
}

export const PayoutProcessor = () => {
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewAmbassador[]>([]);
  
  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  
  const [periodEnd, setPeriodEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchBatches();
    
    // Real-time updates
    const channel = supabase
      .channel('payout-batches-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payout_batches' },
        () => {
          fetchBatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching payout batches:', error);
      toast.error('Failed to fetch payout batches');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-monthly-payouts', {
        body: {
          payout_period_start: periodStart,
          payout_period_end: periodEnd,
          dry_run: true
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setPreviewData(data.ambassadors || []);
      setShowPreviewDialog(true);
    } catch (error: any) {
      console.error('Error previewing payouts:', error);
      toast.error(error.message || 'Failed to preview payouts');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessPayouts = async () => {
    setProcessing(true);
    try {
      const batchName = `${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()}`;
      
      const { data, error } = await supabase.functions.invoke('process-monthly-payouts', {
        body: {
          payout_period_start: periodStart,
          payout_period_end: periodEnd,
          batch_name: batchName,
          dry_run: false
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Processed ${data.totalAmbassadors} ambassador payouts totaling ${formatCurrency(data.totalAmount)}`);
      setShowProcessDialog(false);
      setShowPreviewDialog(false);
      fetchBatches();
    } catch (error: any) {
      console.error('Error processing payouts:', error);
      toast.error(error.message || 'Failed to process payouts');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><Check className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPaid = batches
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.total_commission_amount), 0);

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payout Batches</p>
                  <p className="text-2xl font-bold">{batches.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ambassadors Paid</p>
                  <p className="text-2xl font-bold">
                    {batches.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_ambassadors, 0)}
                  </p>
                </div>
                <Check className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Process Monthly Payouts</CardTitle>
                <CardDescription>
                  Process commission payouts for eligible ambassadors
                </CardDescription>
              </div>
              <Button onClick={() => setShowProcessDialog(true)}>
                <PlayCircle className="w-4 h-4 mr-2" />
                Process Payout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payout batches yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Ambassadors</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">#{batch.batch_number}</p>
                          <p className="text-xs text-muted-foreground">{batch.batch_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(batch.payout_period_start).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">to {new Date(batch.payout_period_end).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{batch.total_ambassadors}</TableCell>
                      <TableCell className="font-medium">{batch.total_commissions_count}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(Number(batch.total_commission_amount))}
                      </TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Process Payout Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Monthly Payout</DialogTitle>
            <DialogDescription>
              Select the payout period to process commission payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="period-start">Period Start</Label>
              <Input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="period-end">Period End</Label>
              <Input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProcessDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handlePreview}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
              Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payout Preview</DialogTitle>
            <DialogDescription>
              Review eligible ambassadors before processing
            </DialogDescription>
          </DialogHeader>
          {previewData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No eligible ambassadors for this period (minimum $100 required)
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Ambassadors</p>
                    <p className="text-2xl font-bold">{previewData.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(previewData.reduce((sum, a) => sum + a.total_amount, 0))}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((ambassador) => (
                    <TableRow key={ambassador.ambassador_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ambassador.ambassador_name}</p>
                          <p className="text-xs text-muted-foreground">{ambassador.ambassador_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ambassador.commission_count}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(ambassador.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            {previewData.length > 0 && (
              <Button
                onClick={handleProcessPayouts}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Process {previewData.length} Payout{previewData.length !== 1 ? 's' : ''}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
