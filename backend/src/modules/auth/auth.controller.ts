import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { GetUserProfileUseCase } from "../../application/auth/get-user-profile.use-case";
import { ValidateUserUseCase } from "../../application/auth/validate-user.use-case";

@Controller("auth")
@UseGuards(AuthGuard)
export class AuthController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly validateUserUseCase: ValidateUserUseCase,
  ) {}

  @Get("me")
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    const userProfile = await this.getUserProfileUseCase.execute(user.id);
    return {
      success: true,
      data: userProfile,
    };
  }

  @Get("validate")
  @HttpCode(HttpStatus.OK)
  async validateToken(@CurrentUser() user: AuthenticatedUser) {
    const isValid = await this.validateUserUseCase.execute(user.id);
    return {
      success: true,
      data: {
        valid: isValid,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
}
