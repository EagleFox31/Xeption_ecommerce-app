import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { GetUserProfileUseCase } from "../../application/auth/get-user-profile.use-case";
import { ValidateUserUseCase } from "../../application/auth/validate-user.use-case";
import { PrismaAuthRepository } from "../../infrastructure/prisma/repositories/auth.repository";
import { AUTH_REPOSITORY } from "../../domain/auth/auth.port";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    GetUserProfileUseCase,
    ValidateUserUseCase,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
