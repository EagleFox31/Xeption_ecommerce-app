import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepositoryPort } from "../../domain/users/user.port";
import { User, UpdateUserDto } from "../../domain/users/user.entity";

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string, updates: UpdateUserDto): Promise<User> {
    const userExists = await this.userRepository.validateUserExists(userId);

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.userRepository.updateUser(userId, updates);
  }
}
