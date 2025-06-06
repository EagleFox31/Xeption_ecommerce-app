import {
  User,
  UserAddress,
  CreateAddressDto,
  UpdateAddressDto,
  UpdateUserDto,
} from "./user.entity";

export interface UserRepositoryPort {
  // User management
  getUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, updates: UpdateUserDto): Promise<User>;
  validateUserExists(userId: string): Promise<boolean>;

  // Address management
  getUserAddresses(userId: string): Promise<UserAddress[]>;
  getAddressById(
    addressId: string,
    userId: string,
  ): Promise<UserAddress | null>;
  createAddress(
    userId: string,
    addressData: CreateAddressDto,
  ): Promise<UserAddress>;
  updateAddress(
    addressId: string,
    userId: string,
    updates: UpdateAddressDto,
  ): Promise<UserAddress>;
  deleteAddress(addressId: string, userId: string): Promise<void>;
  setDefaultAddress(addressId: string, userId: string): Promise<void>;
  getDefaultAddress(userId: string): Promise<UserAddress | null>;
}
