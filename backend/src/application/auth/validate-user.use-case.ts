import { Injectable } from "@nestjs/common";
import { AuthRepositoryPort } from "../../domain/auth/auth.port";

@Injectable()
export class ValidateUserUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(userId: string): Promise<boolean> {
    return await this.authRepository.validateUserExists(userId);
  }
}
