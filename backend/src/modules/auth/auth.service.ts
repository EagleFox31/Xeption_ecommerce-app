import { Injectable } from "@nestjs/common";
import { GetUserProfileUseCase } from "../../application/auth/get-user-profile.use-case";
import { ValidateUserUseCase } from "../../application/auth/validate-user.use-case";
import { UserProfile } from "../../domain/auth/auth.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly validateUserUseCase: ValidateUserUseCase,
  ) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await this.getUserProfileUseCase.execute(userId);
  }

  async validateUser(userId: string): Promise<boolean> {
    return await this.validateUserUseCase.execute(userId);
  }
}
