import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepositoryPort } from "../../domain/users/user.port";
import { UserAddress } from "../../domain/users/user.entity";

@Injectable()
export class GetUserAddressesUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<UserAddress[]> {
    const userExists = await this.userRepository.validateUserExists(userId);

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.userRepository.getUserAddresses(userId);
  }
}
