export interface ImportJob {
  id: string;
  created_by: string;
  file_name: string;
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  current_batch: number;
  total_batches: number;
  error_log: any; // Json type from Supabase
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_updated_at: string;
  csv_data?: string;
}
