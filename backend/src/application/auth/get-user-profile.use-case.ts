import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { AuthRepositoryPort, AUTH_REPOSITORY } from "../../domain/auth/auth.port";
import { UserProfile } from "../../domain/auth/auth.entity";

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort
  ) {}

  async execute(userId: string): Promise<UserProfile> {
    const userProfile = await this.authRepository.getUserProfile(userId);
    
    if (!userProfile) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return userProfile;
  }
}
