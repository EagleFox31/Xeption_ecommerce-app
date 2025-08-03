import { Injectable, Inject } from "@nestjs/common";
import { AuthRepositoryPort, AUTH_REPOSITORY } from "../../domain/auth/auth.port";

@Injectable()
export class ValidateUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort
  ) {}

  async execute(userId: string): Promise<boolean> {
    return await this.authRepository.validateUserExists(userId);
  }
}
