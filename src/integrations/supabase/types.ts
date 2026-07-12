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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          fname: string
          id: string
          ig_followers: number | null
          instagram: string | null
          lname: string | null
          niche: string | null
          notes: string | null
          onlyfans: string | null
          phone: string | null
          plan: string
          ref_code: string | null
          status: string
          tiktok: string | null
          tiktok_followers: number | null
          x_handle: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          fname: string
          id?: string
          ig_followers?: number | null
          instagram?: string | null
          lname?: string | null
          niche?: string | null
          notes?: string | null
          onlyfans?: string | null
          phone?: string | null
          plan?: string
          ref_code?: string | null
          status?: string
          tiktok?: string | null
          tiktok_followers?: number | null
          x_handle?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          fname?: string
          id?: string
          ig_followers?: number | null
          instagram?: string | null
          lname?: string | null
          niche?: string | null
          notes?: string | null
          onlyfans?: string | null
          phone?: string | null
          plan?: string
          ref_code?: string | null
          status?: string
          tiktok?: string | null
          tiktok_followers?: number | null
          x_handle?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      link_clicks: {
        Row: {
          code: string
          country: string | null
          created_at: string
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tracking_links: {
        Row: {
          archived: boolean
          code: string
          created_at: string
          destination: string | null
          id: string
          label: string
        }
        Insert: {
          archived?: boolean
          code: string
          created_at?: string
          destination?: string | null
          id?: string
          label: string
        }
        Update: {
          archived?: boolean
          code?: string
          created_at?: string
          destination?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      twitter_va_applications: {
        Row: {
          country: string
          created_at: string
          discord_username: string
          id: string
          status: string
          telegram_username: string
          twitter_account_available: boolean
          twitter_username: string | null
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          discord_username?: string
          id?: string
          status?: string
          telegram_username?: string
          twitter_account_available?: boolean
          twitter_username?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          discord_username?: string
          id?: string
          status?: string
          telegram_username?: string
          twitter_account_available?: boolean
          twitter_username?: string | null
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      va_applications: {
        Row: {
          age: number | null
          availability: string
          caption_examples: string
          country: string
          created_at: string
          discord_username: string
          email: string | null
          full_name: string
          id: string
          reason_for_fit: string
          reddit_account_available: boolean
          reddit_username: string | null
          status: string
          telegram_username: string
          washington_community_answer: string
        }
        Insert: {
          age?: number | null
          availability: string
          caption_examples: string
          country: string
          created_at?: string
          discord_username: string
          email?: string | null
          full_name: string
          id?: string
          reason_for_fit: string
          reddit_account_available?: boolean
          reddit_username?: string | null
          status?: string
          telegram_username?: string
          washington_community_answer: string
        }
        Update: {
          age?: number | null
          availability?: string
          caption_examples?: string
          country?: string
          created_at?: string
          discord_username?: string
          email?: string | null
          full_name?: string
          id?: string
          reason_for_fit?: string
          reddit_account_available?: boolean
          reddit_username?: string | null
          status?: string
          telegram_username?: string
          washington_community_answer?: string
        }
        Relationships: []
      }
      x_manager_commission_baseline: {
        Row: {
          paid_baseline_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          paid_baseline_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          paid_baseline_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      x_tracker_accounts: {
        Row: {
          added_by_user_id: string | null
          created_at: string
          current_views: number
          employee_name: string
          id: string
          last_refresh_at: string | null
          last_screenshot_upload_at: string | null
          last_updated: string | null
          notes: string | null
          payout_owed_cents: number
          pinned_post_url: string | null
          previous_views: number
          profile_url: string
          rate_cents_per_1k: number
          screenshot_url: string | null
          status: string
          status_message: string | null
          updated_at: string
          views_gained_since_last: number
          weekly_starting_views: number
          x_username: string
        }
        Insert: {
          added_by_user_id?: string | null
          created_at?: string
          current_views?: number
          employee_name?: string
          id?: string
          last_refresh_at?: string | null
          last_screenshot_upload_at?: string | null
          last_updated?: string | null
          notes?: string | null
          payout_owed_cents?: number
          pinned_post_url?: string | null
          previous_views?: number
          profile_url: string
          rate_cents_per_1k?: number
          screenshot_url?: string | null
          status?: string
          status_message?: string | null
          updated_at?: string
          views_gained_since_last?: number
          weekly_starting_views?: number
          x_username: string
        }
        Update: {
          added_by_user_id?: string | null
          created_at?: string
          current_views?: number
          employee_name?: string
          id?: string
          last_refresh_at?: string | null
          last_screenshot_upload_at?: string | null
          last_updated?: string | null
          notes?: string | null
          payout_owed_cents?: number
          pinned_post_url?: string | null
          previous_views?: number
          profile_url?: string
          rate_cents_per_1k?: number
          screenshot_url?: string | null
          status?: string
          status_message?: string | null
          updated_at?: string
          views_gained_since_last?: number
          weekly_starting_views?: number
          x_username?: string
        }
        Relationships: []
      }
      x_tracker_history: {
        Row: {
          account_id: string | null
          added_by_user_id: string | null
          created_at: string
          employee_name: string
          ending_views: number
          id: string
          starting_views: number
          week_end: string
          week_start: string
          weekly_pay_cents: number
          weekly_views: number
          x_username: string
        }
        Insert: {
          account_id?: string | null
          added_by_user_id?: string | null
          created_at?: string
          employee_name?: string
          ending_views?: number
          id?: string
          starting_views?: number
          week_end: string
          week_start: string
          weekly_pay_cents?: number
          weekly_views?: number
          x_username: string
        }
        Update: {
          account_id?: string | null
          added_by_user_id?: string | null
          created_at?: string
          employee_name?: string
          ending_views?: number
          id?: string
          starting_views?: number
          week_end?: string
          week_start?: string
          weekly_pay_cents?: number
          weekly_views?: number
          x_username?: string
        }
        Relationships: [
          {
            foreignKeyName: "x_tracker_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "x_tracker_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      x_tracker_screenshots: {
        Row: {
          account_id: string | null
          added_by_user_id: string | null
          created_at: string
          detected_views: number | null
          employee_name: string
          id: string
          new_views: number
          payout_cents: number
          previous_views: number
          rate_cents_per_1k: number
          screenshot_url: string
          uploaded_at: string
          views_gained: number
          x_username: string
        }
        Insert: {
          account_id?: string | null
          added_by_user_id?: string | null
          created_at?: string
          detected_views?: number | null
          employee_name?: string
          id?: string
          new_views?: number
          payout_cents?: number
          previous_views?: number
          rate_cents_per_1k?: number
          screenshot_url: string
          uploaded_at?: string
          views_gained?: number
          x_username: string
        }
        Update: {
          account_id?: string | null
          added_by_user_id?: string | null
          created_at?: string
          detected_views?: number | null
          employee_name?: string
          id?: string
          new_views?: number
          payout_cents?: number
          previous_views?: number
          rate_cents_per_1k?: number
          screenshot_url?: string
          uploaded_at?: string
          views_gained?: number
          x_username?: string
        }
        Relationships: [
          {
            foreignKeyName: "x_tracker_screenshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "x_tracker_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_my_manager_commission: {
        Args: never
        Returns: {
          lifetime_commission_cents: number
          paid_baseline_cents: number
          unpaid_commission_cents: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_managers: {
        Args: never
        Returns: {
          email: string
          paid_baseline_cents: number
          user_id: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      reset_manager_commission: {
        Args: { _lifetime_cents: number; _manager: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "manager"
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
      app_role: ["admin", "user", "manager"],
    },
  },
} as const
