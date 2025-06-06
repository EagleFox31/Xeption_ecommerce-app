import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { GetUserProfileUseCase } from "../../application/auth/get-user-profile.use-case";
import { ValidateUserUseCase } from "../../application/auth/validate-user.use-case";
import { AuthRepository } from "../../infrastructure/supabase/repositories/auth.repository";
import { AuthRepositoryPort } from "../../domain/auth/auth.port";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    GetUserProfileUseCase,
    ValidateUserUseCase,
    {
      provide: AuthRepositoryPort,
      useClass: AuthRepository,
    },
  ],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
