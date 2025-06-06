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
import { UserRepository } from "../../infrastructure/supabase/repositories/user.repository";
import { UserRepositoryPort } from "../../domain/users/user.port";

@Module({
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
      provide: UserRepositoryPort,
      useClass: UserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
