import { UserProfile, AuthValidationResult } from "./auth.entity";

export interface AuthRepositoryPort {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  validateUserExists(userId: string): Promise<boolean>;
}
