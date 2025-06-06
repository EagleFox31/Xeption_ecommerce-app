import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepositoryPort } from "../../domain/users/user.port";

@Injectable()
export class DeleteUserAddressUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(addressId: string, userId: string): Promise<void> {
    const address = await this.userRepository.getAddressById(addressId, userId);

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    await this.userRepository.deleteAddress(addressId, userId);
  }
}
