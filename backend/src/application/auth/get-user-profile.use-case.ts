import { Injectable } from "@nestjs/common";
import { AuthRepositoryPort } from "../../domain/auth/auth.port";
import { UserProfile } from "../../domain/auth/auth.entity";

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return await this.authRepository.getUserProfile(userId);
  }
}
