import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AuthRepositoryPort } from "../../../domain/auth/auth.port";
import { UserProfile } from "../../../domain/auth/auth.entity";

@Injectable()
export class AuthRepository implements AuthRepositoryPort {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>("SUPABASE_URL"),
      this.configService.get<string>("SUPABASE_SERVICE_KEY"),
    );
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Get user from auth.users
      const { data: authUser, error: authError } =
        await this.supabase.auth.admin.getUserById(userId);

      if (authError || !authUser.user) {
        return null;
      }

      // Get additional profile data from public.users if exists
      const { data: profileData } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      const user = authUser.user;

      return new UserProfile(
        user.id,
        user.email,
        profileData?.first_name || user.user_metadata?.first_name,
        profileData?.last_name || user.user_metadata?.last_name,
        profileData?.phone || user.phone,
        profileData?.role || user.user_metadata?.role || "customer",
        user.email_confirmed_at !== null,
        new Date(user.created_at),
        new Date(user.updated_at),
        { ...user.user_metadata, ...profileData },
      );
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const { data, error } =
        await this.supabase.auth.admin.getUserById(userId);
      return !error && !!data.user;
    } catch (error) {
      return false;
    }
  }
}
