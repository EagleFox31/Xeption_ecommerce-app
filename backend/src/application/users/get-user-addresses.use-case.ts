import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { UserRepositoryPort, USER_REPOSITORY } from "../../domain/users/user.port";
import { UserAddress } from "../../domain/users/user.entity";

@Injectable()
export class GetUserAddressesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(userId: string): Promise<UserAddress[]> {
    const userExists = await this.userRepository.validateUserExists(userId);

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.userRepository.getUserAddresses(userId);
  }
}
