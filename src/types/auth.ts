import { Session, User } from "@supabase/supabase-js";

export interface Profile {
    id: string;
    email: string;
    role: string;
    api_calls_made: number;
    last_api_call_date: Date;
    first_name: string | null;
    last_name: string | null;
    can_upload_blog: boolean;
    onboarding_completed: boolean;
    onboarding_step: number;
    onboarding_profile: any
}

export interface Auth {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoaded: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
