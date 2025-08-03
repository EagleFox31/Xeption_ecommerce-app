import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { UserRepositoryPort, USER_REPOSITORY } from "../../domain/users/user.port";

@Injectable()
export class SetDefaultAddressUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(addressId: string, userId: string): Promise<void> {
    const address = await this.userRepository.getAddressById(addressId, userId);

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    await this.userRepository.setDefaultAddress(addressId, userId);
  }
}
