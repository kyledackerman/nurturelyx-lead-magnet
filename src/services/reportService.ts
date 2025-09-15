import { supabase } from "@/integrations/supabase/client";
import { ReportData } from "@/types/report";

export interface SaveReportResponse {
  reportId: string;
  slug: string;
  publicUrl: string;
  success: boolean;
}

export interface GetReportResponse {
  reportData: ReportData;
  reportId: string;
  slug: string;
  createdAt: string;
  domain: string;
}

export const reportService = {
  async saveReport(reportData: ReportData, userId?: string): Promise<SaveReportResponse> {
    const { data, error } = await supabase.functions.invoke('save-report', {
      body: { reportData, userId }
    });

    if (error) {
      console.error('Error saving report:', error);
      throw new Error('Failed to save report');
    }

    return data;
  },

  async getReport(reportId?: string, slug?: string): Promise<GetReportResponse> {
    const params = new URLSearchParams();
    if (reportId) params.append('id', reportId);
    if (slug) params.append('slug', slug);

    const { data, error } = await supabase.functions.invoke('get-report', {
      body: null,
      method: 'GET'
    });

    if (error) {
      console.error('Error fetching report:', error);
      throw new Error('Failed to fetch report');
    }

    return data;
  },

  async trackShare(reportId: string, platform: string): Promise<void> {
    const { error } = await supabase.functions.invoke('track-share', {
      body: { reportId, platform }
    });

    if (error) {
      console.error('Error tracking share:', error);
      // Don't throw here - sharing should still work even if tracking fails
    }
  },

  // Generate shareable URL
  generateShareUrl(slug: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/report/${slug}`;
  },

  // Generate social sharing text
  generateShareText(reportData: ReportData): string {
    const lostRevenue = reportData.yearlyRevenueLost || 0;
    const missedLeads = reportData.missedLeads || 0;
    
    return `🚨 Just discovered ${reportData.domain} is missing ${missedLeads.toLocaleString()} potential leads annually, representing $${lostRevenue.toLocaleString()} in lost revenue! Check out this detailed analysis:`;
  }
};