import { Injectable } from "@nestjs/common";
import { GetUserProfileUseCase } from "../../application/users/get-user-profile.use-case";
import { UpdateUserProfileUseCase } from "../../application/users/update-user-profile.use-case";
import { GetUserAddressesUseCase } from "../../application/users/get-user-addresses.use-case";
import { CreateUserAddressUseCase } from "../../application/users/create-user-address.use-case";
import { UpdateUserAddressUseCase } from "../../application/users/update-user-address.use-case";
import { DeleteUserAddressUseCase } from "../../application/users/delete-user-address.use-case";
import { SetDefaultAddressUseCase } from "../../application/users/set-default-address.use-case";
import {
  User,
  UserAddress,
  CreateAddressDto,
  UpdateAddressDto,
  UpdateUserDto,
} from "../../domain/users/user.entity";

@Injectable()
export class UsersService {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly createUserAddressUseCase: CreateUserAddressUseCase,
    private readonly updateUserAddressUseCase: UpdateUserAddressUseCase,
    private readonly deleteUserAddressUseCase: DeleteUserAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    return await this.getUserProfileUseCase.execute(userId);
  }

  async updateUserProfile(
    userId: string,
    updates: UpdateUserDto,
  ): Promise<User> {
    return await this.updateUserProfileUseCase.execute(userId, updates);
  }

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return await this.getUserAddressesUseCase.execute(userId);
  }

  async createAddress(
    userId: string,
    addressData: CreateAddressDto,
  ): Promise<UserAddress> {
    return await this.createUserAddressUseCase.execute(userId, addressData);
  }

  async updateAddress(
    addressId: string,
    userId: string,
    updates: UpdateAddressDto,
  ): Promise<UserAddress> {
    return await this.updateUserAddressUseCase.execute(
      addressId,
      userId,
      updates,
    );
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    await this.deleteUserAddressUseCase.execute(addressId, userId);
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    await this.setDefaultAddressUseCase.execute(addressId, userId);
  }
}
