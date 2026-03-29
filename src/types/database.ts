export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_tier: "free" | "pro";
  subscription_status: "active" | "canceled" | "past_due" | "trialing";
  scrape_count_this_month: number;
  current_period_start: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapeJob {
  id: string;
  user_id: string;
  message: string;
  url: string | null;
  status: "pending" | "generating" | "complete" | "error";
  ai_response: string | null;
  generated_script: string | null;
  zod_schema: string | null;
  results: Record<string, unknown>[] | null;
  items_count: number;
  error: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  url_pattern: string | null;
  script_template: string;
  schema_definition: string | null;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
      };
      scrape_jobs: {
        Row: ScrapeJob;
        Insert: Omit<ScrapeJob, "id" | "created_at"> & { id?: string };
        Update: Partial<ScrapeJob>;
      };
      recipes: {
        Row: Recipe;
        Insert: Omit<Recipe, "id" | "created_at" | "updated_at" | "times_used"> & { id?: string };
        Update: Partial<Recipe>;
      };
    };
  };
}
