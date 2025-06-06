import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepositoryPort } from "../../domain/users/user.port";
import { UserAddress, UpdateAddressDto } from "../../domain/users/user.entity";

@Injectable()
export class UpdateUserAddressUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(
    addressId: string,
    userId: string,
    updates: UpdateAddressDto,
  ): Promise<UserAddress> {
    const address = await this.userRepository.getAddressById(addressId, userId);

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    return await this.userRepository.updateAddress(addressId, userId, updates);
  }
}
