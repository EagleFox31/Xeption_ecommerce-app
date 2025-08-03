import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { GetUserProfileUseCase } from "../../application/users/get-user-profile.use-case";
import { UpdateUserProfileUseCase } from "../../application/users/update-user-profile.use-case";
import { GetUserAddressesUseCase } from "../../application/users/get-user-addresses.use-case";
import { CreateUserAddressUseCase } from "../../application/users/create-user-address.use-case";
import { UpdateUserAddressUseCase } from "../../application/users/update-user-address.use-case";
import { DeleteUserAddressUseCase } from "../../application/users/delete-user-address.use-case";
import { SetDefaultAddressUseCase } from "../../application/users/set-default-address.use-case";
import { PrismaUserRepository } from "../../infrastructure/prisma/repositories/user.repository";
import { USER_REPOSITORY } from "../../domain/users/user.port";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthGuard,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserAddressesUseCase,
    CreateUserAddressUseCase,
    UpdateUserAddressUseCase,
    DeleteUserAddressUseCase,
    SetDefaultAddressUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
