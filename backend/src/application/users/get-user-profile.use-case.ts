import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepositoryPort } from "../../domain/users/user.port";
import { User } from "../../domain/users/user.entity";

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}
