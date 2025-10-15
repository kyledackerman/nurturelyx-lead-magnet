export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          business_context: string | null
          changed_at: string
          changed_by: string | null
          created_at: string
          field_name: string | null
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          record_id: string
          session_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          business_context?: string | null
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          record_id: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          business_context?: string | null
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          record_id?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      enrichment_job_items: {
        Row: {
          completed_at: string | null
          contacts_found: number | null
          domain: string
          error_message: string | null
          id: string
          job_id: string | null
          prospect_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          contacts_found?: number | null
          domain: string
          error_message?: string | null
          id?: string
          job_id?: string | null
          prospect_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          contacts_found?: number | null
          domain?: string
          error_message?: string | null
          id?: string
          job_id?: string | null
          prospect_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_job_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "enrichment_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_job_items_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospect_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      enrichment_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          failed_count: number | null
          id: string
          job_type: string | null
          processed_count: number | null
          started_at: string | null
          status: string | null
          success_count: number | null
          total_count: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          job_type?: string | null
          processed_count?: number | null
          started_at?: string | null
          status?: string | null
          success_count?: number | null
          total_count: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          job_type?: string | null
          processed_count?: number | null
          started_at?: string | null
          status?: string | null
          success_count?: number | null
          total_count?: number
        }
        Relationships: []
      }
      enrichment_settings: {
        Row: {
          auto_enrichment_enabled: boolean
          created_at: string
          facebook_scraping_enabled: boolean | null
          id: string
          last_run_at: string | null
          total_enriched: number
          total_failed: number
          updated_at: string
        }
        Insert: {
          auto_enrichment_enabled?: boolean
          created_at?: string
          facebook_scraping_enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          total_enriched?: number
          total_failed?: number
          updated_at?: string
        }
        Update: {
          auto_enrichment_enabled?: boolean
          created_at?: string
          facebook_scraping_enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          total_enriched?: number
          total_failed?: number
          updated_at?: string
        }
        Relationships: []
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          csv_data: string
          current_batch: number | null
          error_log: Json | null
          failed_rows: number | null
          file_name: string
          id: string
          last_updated_at: string | null
          processed_rows: number | null
          started_at: string | null
          status: string | null
          successful_rows: number | null
          total_batches: number | null
          total_rows: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          csv_data: string
          current_batch?: number | null
          error_log?: Json | null
          failed_rows?: number | null
          file_name: string
          id?: string
          last_updated_at?: string | null
          processed_rows?: number | null
          started_at?: string | null
          status?: string | null
          successful_rows?: number | null
          total_batches?: number | null
          total_rows: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          csv_data?: string
          current_batch?: number | null
          error_log?: Json | null
          failed_rows?: number | null
          file_name?: string
          id?: string
          last_updated_at?: string | null
          processed_rows?: number | null
          started_at?: string | null
          status?: string | null
          successful_rows?: number | null
          total_batches?: number | null
          total_rows?: number
        }
        Relationships: []
      }
      password_reset_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          id: string
          reason: string | null
          requested_by: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_by: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_by?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prospect_activities: {
        Row: {
          activity_type: string
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          auto_enriched: boolean | null
          closed_at: string | null
          contact_count: number | null
          contact_method: string | null
          created_at: string
          created_by: string | null
          enrichment_locked_at: string | null
          enrichment_locked_by: string | null
          enrichment_retry_count: number | null
          enrichment_source: string | null
          icebreaker_edited_manually: boolean | null
          icebreaker_generated_at: string | null
          icebreaker_previous: string | null
          icebreaker_text: string | null
          id: string
          last_enrichment_attempt: string | null
          lead_source: string | null
          lost_notes: string | null
          lost_reason: string | null
          next_follow_up: string | null
          notes: string | null
          priority: string
          report_id: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          auto_enriched?: boolean | null
          closed_at?: string | null
          contact_count?: number | null
          contact_method?: string | null
          created_at?: string
          created_by?: string | null
          enrichment_locked_at?: string | null
          enrichment_locked_by?: string | null
          enrichment_retry_count?: number | null
          enrichment_source?: string | null
          icebreaker_edited_manually?: boolean | null
          icebreaker_generated_at?: string | null
          icebreaker_previous?: string | null
          icebreaker_text?: string | null
          id?: string
          last_enrichment_attempt?: string | null
          lead_source?: string | null
          lost_notes?: string | null
          lost_reason?: string | null
          next_follow_up?: string | null
          notes?: string | null
          priority?: string
          report_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          auto_enriched?: boolean | null
          closed_at?: string | null
          contact_count?: number | null
          contact_method?: string | null
          created_at?: string
          created_by?: string | null
          enrichment_locked_at?: string | null
          enrichment_locked_by?: string | null
          enrichment_retry_count?: number | null
          enrichment_source?: string | null
          icebreaker_edited_manually?: boolean | null
          icebreaker_generated_at?: string | null
          icebreaker_previous?: string | null
          icebreaker_text?: string | null
          id?: string
          last_enrichment_attempt?: string | null
          lead_source?: string | null
          lost_notes?: string | null
          lost_reason?: string | null
          next_follow_up?: string | null
          notes?: string | null
          priority?: string
          report_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_prospect_activities_report"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_contacts: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          facebook_url: string | null
          first_name: string
          id: string
          is_primary: boolean
          last_name: string | null
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          prospect_activity_id: string
          report_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          facebook_url?: string | null
          first_name: string
          id?: string
          is_primary?: boolean
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          prospect_activity_id: string
          report_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          facebook_url?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          prospect_activity_id?: string
          report_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_contacts_prospect_activity_id_fkey"
            columns: ["prospect_activity_id"]
            isOneToOne: false
            referencedRelation: "prospect_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_contacts_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_exports: {
        Row: {
          auto_updated_to_contacted: boolean
          created_at: string
          domains: string[]
          export_count: number
          exported_at: string
          exported_by: string
          filters_applied: Json | null
          id: string
          prospect_ids: string[]
        }
        Insert: {
          auto_updated_to_contacted?: boolean
          created_at?: string
          domains: string[]
          export_count: number
          exported_at?: string
          exported_by: string
          filters_applied?: Json | null
          id?: string
          prospect_ids: string[]
        }
        Update: {
          auto_updated_to_contacted?: boolean
          created_at?: string
          domains?: string[]
          export_count?: number
          exported_at?: string
          exported_by?: string
          filters_applied?: Json | null
          id?: string
          prospect_ids?: string[]
        }
        Relationships: []
      }
      prospect_imports: {
        Row: {
          created_at: string
          error_log: Json | null
          failed_rows: number
          file_name: string
          id: string
          imported_at: string
          imported_by: string
          successful_rows: number
          total_rows: number
        }
        Insert: {
          created_at?: string
          error_log?: Json | null
          failed_rows: number
          file_name: string
          id?: string
          imported_at?: string
          imported_by: string
          successful_rows: number
          total_rows: number
        }
        Update: {
          created_at?: string
          error_log?: Json | null
          failed_rows?: number
          file_name?: string
          id?: string
          imported_at?: string
          imported_by?: string
          successful_rows?: number
          total_rows?: number
        }
        Relationships: []
      }
      prospect_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          prospect_activity_id: string | null
          report_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          prospect_activity_id?: string | null
          report_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          prospect_activity_id?: string | null
          report_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_tasks_prospect_activity_id_fkey"
            columns: ["prospect_activity_id"]
            isOneToOne: false
            referencedRelation: "prospect_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_tasks_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_shares: {
        Row: {
          id: string
          platform: string
          report_id: string
          shared_at: string
          shared_by_ip_hash: string
        }
        Insert: {
          id?: string
          platform: string
          report_id: string
          shared_at?: string
          shared_by_ip_hash: string
        }
        Update: {
          id?: string
          platform?: string
          report_id?: string
          shared_at?: string
          shared_by_ip_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_shares_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_views: {
        Row: {
          id: string
          ip_address_hash: string
          page_path: string | null
          page_type: string | null
          referrer: string | null
          report_id: string | null
          session_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address_hash: string
          page_path?: string | null
          page_type?: string | null
          referrer?: string | null
          report_id?: string | null
          session_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address_hash?: string
          page_path?: string | null
          page_type?: string | null
          referrer?: string | null
          report_id?: string | null
          session_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_views_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          city: string | null
          company_size: string | null
          created_at: string
          domain: string
          extracted_company_name: string | null
          facebook_url: string | null
          id: string
          import_source: string | null
          industry: string | null
          is_public: boolean
          lead_source: string | null
          monthly_traffic_tier: string | null
          report_data: Json
          seo_description: string | null
          seo_title: string | null
          slug: string
          state: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          company_size?: string | null
          created_at?: string
          domain: string
          extracted_company_name?: string | null
          facebook_url?: string | null
          id?: string
          import_source?: string | null
          industry?: string | null
          is_public?: boolean
          lead_source?: string | null
          monthly_traffic_tier?: string | null
          report_data: Json
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          company_size?: string | null
          created_at?: string
          domain?: string
          extracted_company_name?: string | null
          facebook_url?: string | null
          id?: string
          import_source?: string | null
          industry?: string | null
          is_public?: boolean
          lead_source?: string | null
          monthly_traffic_tier?: string | null
          report_data?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_enrichment_lock: {
        Args: { p_prospect_id: string; p_source: string }
        Returns: boolean
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_report_slug: {
        Args: { domain_name: string }
        Returns: string
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_average_deal_size: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_chart_data: {
        Args: { period?: string }
        Returns: Json
      }
      get_crm_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_crm_prospects_with_stats: {
        Args:
          | {
              p_assigned_filter?: string
              p_lead_source?: string
              p_limit?: number
              p_offset?: number
              p_status_filter?: string[]
              p_view?: string
            }
          | {
              p_assigned_filter?: string
              p_limit?: number
              p_offset?: number
              p_status_filter?: string[]
            }
          | {
              p_assigned_filter?: string
              p_limit?: number
              p_offset?: number
              p_status_filter?: string[]
              p_view?: string
            }
        Returns: {
          assigned_to: string
          company_name: string
          contact_count: number
          created_at: string
          domain: string
          enrichment_retry_count: number
          icebreaker_text: string
          id: string
          lead_source: string
          lost_notes: string
          lost_reason: string
          missed_leads: number
          monthly_revenue: number
          priority: string
          report_id: string
          slug: string
          status: string
          traffic_tier: string
          updated_at: string
        }[]
      }
      get_domain_contact_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          contact_count: number
          domain: string
        }[]
      }
      get_peak_performance_day: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_quality_score: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_top_leads_domain: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_top_revenue_domain: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_total_market_opportunity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_views_chart_data: {
        Args: { period?: string }
        Returns: Json
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      log_business_context: {
        Args: {
          p_context: string
          p_ip_address?: string
          p_record_id: string
          p_session_id?: string
          p_table_name: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_field_changes: {
        Args: {
          p_action_type: string
          p_changed_by?: string
          p_new_row?: Json
          p_old_row?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
      release_enrichment_lock: {
        Args: { p_prospect_id: string }
        Returns: undefined
      }
      validate_prospect_email_contacts: {
        Args: Record<PropertyKey, never>
        Returns: {
          moved_count: number
          moved_prospect_ids: string[]
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "super_admin"],
    },
  },
} as const
