/**
 * Supabase database types.
 *
 * Hand-written to match the migrations below in the exact shape
 * `supabase gen types typescript` produces, since no local Supabase
 * instance was available to run codegen against in this environment.
 * Once Supabase is running locally, regenerate for real and diff against
 * this file:
 *
 *   supabase gen types typescript --local > types/database.types.ts
 *
 * Migrations reflected here:
 *   - 20260808120000_auth_profile_foundation.sql       (Sprint 1)
 *   - 20260808130000_founder_investor_profile_details.sql (Sprint 2)
 *   - 20260809080000_startups.sql                       (Sprint 3)
 *   - 20260810090000_founder_many_startups.sql          (Sprint 4)
 *   - 20260811090000_investor_discovery.sql              (Sprint 5)
 *   - 20260812100000_investor_interest.sql               (Sprint 6)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Database["public"]["Enums"]["user_role"];
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      founder_profiles: {
        Row: {
          id: string;
          job_title: string | null;
          country: string | null;
          bio: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          job_title?: string | null;
          country?: string | null;
          bio?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_title?: string | null;
          country?: string | null;
          bio?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "founder_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      investor_profiles: {
        Row: {
          id: string;
          organization: string | null;
          investor_type: Database["public"]["Enums"]["investor_type"] | null;
          country: string | null;
          bio: string | null;
          linkedin_url: string | null;
          funding_range_min: number | null;
          funding_range_max: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization?: string | null;
          investor_type?: Database["public"]["Enums"]["investor_type"] | null;
          country?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          funding_range_min?: number | null;
          funding_range_max?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization?: string | null;
          investor_type?: Database["public"]["Enums"]["investor_type"] | null;
          country?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          funding_range_min?: number | null;
          funding_range_max?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investor_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      industries: {
        Row: {
          id: string;
          slug: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      startup_stages: {
        Row: {
          id: string;
          slug: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      investor_industry_preferences: {
        Row: {
          investor_id: string;
          industry_id: string;
          created_at: string;
        };
        Insert: {
          investor_id: string;
          industry_id: string;
          created_at?: string;
        };
        Update: {
          investor_id?: string;
          industry_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investor_industry_preferences_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investor_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_industry_preferences_industry_id_fkey";
            columns: ["industry_id"];
            isOneToOne: false;
            referencedRelation: "industries";
            referencedColumns: ["id"];
          },
        ];
      };
      investor_stage_preferences: {
        Row: {
          investor_id: string;
          stage_id: string;
          created_at: string;
        };
        Insert: {
          investor_id: string;
          stage_id: string;
          created_at?: string;
        };
        Update: {
          investor_id?: string;
          stage_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investor_stage_preferences_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investor_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_stage_preferences_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "startup_stages";
            referencedColumns: ["id"];
          },
        ];
      };
      startups: {
        Row: {
          id: string;
          founder_id: string;
          status: Database["public"]["Enums"]["startup_status"];
          name: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          tagline: string | null;
          description: string | null;
          industry_id: string | null;
          stage_id: string | null;
          country: string | null;
          city: string | null;
          website_url: string | null;
          funding_amount_sought: number | null;
          annual_revenue: number | null;
          monthly_revenue: number | null;
          customer_count: number | null;
          employee_count: number | null;
          pitch_deck_path: string | null;
          pitch_deck_original_name: string | null;
          elevator_pitch: string | null;
          linkedin_url: string | null;
          twitter_url: string | null;
          instagram_url: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          founder_id: string;
          status?: Database["public"]["Enums"]["startup_status"];
          name?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          tagline?: string | null;
          description?: string | null;
          industry_id?: string | null;
          stage_id?: string | null;
          country?: string | null;
          city?: string | null;
          website_url?: string | null;
          funding_amount_sought?: number | null;
          annual_revenue?: number | null;
          monthly_revenue?: number | null;
          customer_count?: number | null;
          employee_count?: number | null;
          pitch_deck_path?: string | null;
          pitch_deck_original_name?: string | null;
          elevator_pitch?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          founder_id?: string;
          status?: Database["public"]["Enums"]["startup_status"];
          name?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          tagline?: string | null;
          description?: string | null;
          industry_id?: string | null;
          stage_id?: string | null;
          country?: string | null;
          city?: string | null;
          website_url?: string | null;
          funding_amount_sought?: number | null;
          annual_revenue?: number | null;
          monthly_revenue?: number | null;
          customer_count?: number | null;
          employee_count?: number | null;
          pitch_deck_path?: string | null;
          pitch_deck_original_name?: string | null;
          elevator_pitch?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "startups_founder_id_fkey";
            columns: ["founder_id"];
            isOneToOne: true;
            referencedRelation: "founder_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "startups_industry_id_fkey";
            columns: ["industry_id"];
            isOneToOne: false;
            referencedRelation: "industries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "startups_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "startup_stages";
            referencedColumns: ["id"];
          },
        ];
      };
      startup_interests: {
        Row: {
          id: string;
          startup_id: string;
          investor_id: string;
          status: Database["public"]["Enums"]["interest_status"];
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          startup_id: string;
          investor_id: string;
          status?: Database["public"]["Enums"]["interest_status"];
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          startup_id?: string;
          investor_id?: string;
          status?: Database["public"]["Enums"]["interest_status"];
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "startup_interests_startup_id_fkey";
            columns: ["startup_id"];
            isOneToOne: false;
            referencedRelation: "startups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "startup_interests_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investor_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          body: string;
          link_path: string;
          startup_interest_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          body: string;
          link_path: string;
          startup_interest_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          title?: string;
          body?: string;
          link_path?: string;
          startup_interest_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_startup_interest_id_fkey";
            columns: ["startup_interest_id"];
            isOneToOne: false;
            referencedRelation: "startup_interests";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      replace_investor_preferences: {
        Args: {
          p_industry_ids: string[] | null;
          p_stage_ids: string[] | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: "founder" | "investor";
      investor_type: "angel" | "vc" | "accelerator" | "syndicate" | "corporate";
      startup_status: "draft" | "published";
      interest_status: "pending" | "accepted" | "declined";
      notification_type: "interest_received" | "interest_accepted" | "interest_declined";
    };
    CompositeTypes: Record<string, never>;
  };
};
