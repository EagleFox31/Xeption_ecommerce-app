import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { GetUserProfileUseCase } from "../../application/users/get-user-profile.use-case";
import { UpdateUserProfileUseCase } from "../../application/users/update-user-profile.use-case";
import { GetUserAddressesUseCase } from "../../application/users/get-user-addresses.use-case";
import { CreateUserAddressUseCase } from "../../application/users/create-user-address.use-case";
import { UpdateUserAddressUseCase } from "../../application/users/update-user-address.use-case";
import { DeleteUserAddressUseCase } from "../../application/users/delete-user-address.use-case";
import { SetDefaultAddressUseCase } from "../../application/users/set-default-address.use-case";
import {
  CreateAddressDto,
  UpdateAddressDto,
  UpdateUserDto,
} from "../../domain/users/user.entity";

@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly createUserAddressUseCase: CreateUserAddressUseCase,
    private readonly updateUserAddressUseCase: UpdateUserAddressUseCase,
    private readonly deleteUserAddressUseCase: DeleteUserAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  @Get("me")
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    const userProfile = await this.getUserProfileUseCase.execute(user.id);
    return {
      success: true,
      data: userProfile,
    };
  }

  @Put("me")
  async updateCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateData: UpdateUserDto,
  ) {
    const updatedUser = await this.updateUserProfileUseCase.execute(
      user.id,
      updateData,
    );
    return {
      success: true,
      data: updatedUser,
    };
  }

  @Get("me/addresses")
  async getUserAddresses(@CurrentUser() user: AuthenticatedUser) {
    const addresses = await this.getUserAddressesUseCase.execute(user.id);
    return {
      success: true,
      data: addresses,
    };
  }

  @Post("me/addresses")
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() addressData: CreateAddressDto,
  ) {
    const address = await this.createUserAddressUseCase.execute(
      user.id,
      addressData,
    );
    return {
      success: true,
      data: address,
    };
  }

  @Put("me/addresses/:addressId")
  async updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param("addressId") addressId: string,
    @Body() updateData: UpdateAddressDto,
  ) {
    const address = await this.updateUserAddressUseCase.execute(
      addressId,
      user.id,
      updateData,
    );
    return {
      success: true,
      data: address,
    };
  }

  @Delete("me/addresses/:addressId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param("addressId") addressId: string,
  ) {
    await this.deleteUserAddressUseCase.execute(addressId, user.id);
    return {
      success: true,
    };
  }

  @Put("me/addresses/:addressId/default")
  async setDefaultAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param("addressId") addressId: string,
  ) {
    await this.setDefaultAddressUseCase.execute(addressId, user.id);
    return {
      success: true,
      message: "Default address updated successfully",
    };
  }
}
