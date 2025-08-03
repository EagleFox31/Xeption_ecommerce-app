import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  User,
  UserAddress,
  AddressType,
  CreateAddressDto,
  UpdateAddressDto,
  UpdateUserDto,
} from "../../../domain/users/user.entity";
import { UserRepositoryPort } from "../../../domain/users/user.port";

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return this.mapToUser(user);
  }

  async updateUser(userId: string, updates: UpdateUserDto): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: updates.firstName && updates.lastName 
          ? `${updates.firstName} ${updates.lastName}`
          : undefined,
        phone237: updates.phone,
      },
    });

    return this.mapToUser(updatedUser);
  }

  async validateUserExists(userId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: userId },
    });
    return count > 0;
  }

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      include: {
        region: true,
        city: true,
        commune: true,
      },
    });

    return addresses.map(address => this.mapToUserAddress(address));
  }

  async getAddressById(
    addressId: string,
    userId: string,
  ): Promise<UserAddress | null> {
    const address = await this.prisma.address.findFirst({
      where: {
        id: BigInt(addressId),
        userId,
      },
      include: {
        region: true,
        city: true,
        commune: true,
      },
    });

    if (!address) {
      return null;
    }

    return this.mapToUserAddress(address);
  }

  async createAddress(
    userId: string,
    addressData: CreateAddressDto,
  ): Promise<UserAddress> {
    // Reset all other addresses as non-default if this one is default
    if (addressData.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await this.prisma.address.create({
      data: {
        userId,
        addressLine: this.buildAddressLine(addressData),
        isDefault: !!addressData.isDefault,
        // Add logic to get region, city, commune IDs from their names
        // This would typically involve separate lookups
      },
      include: {
        region: true,
        city: true,
        commune: true,
      },
    });

    return this.mapToUserAddress(newAddress);
  }

  async updateAddress(
    addressId: string,
    userId: string,
    updates: UpdateAddressDto,
  ): Promise<UserAddress> {
    // If setting as default, reset other addresses
    if (updates.isDefault) {
      await this.prisma.address.updateMany({
        where: {
          userId,
          id: { not: BigInt(addressId) },
        },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await this.prisma.address.update({
      where: {
        id: BigInt(addressId),
      },
      data: {
        addressLine: updates.addressLine1 
          ? this.buildAddressLine(updates)
          : undefined,
        isDefault: updates.isDefault,
        // Update region, city, commune IDs based on their names if provided
      },
      include: {
        region: true,
        city: true,
        commune: true,
      },
    });

    return this.mapToUserAddress(updatedAddress);
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    await this.prisma.address.deleteMany({
      where: {
        id: BigInt(addressId),
        userId,
      },
    });
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    // Reset all addresses to non-default
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Set the specified address as default
    await this.prisma.address.update({
      where: { id: BigInt(addressId) },
      data: { isDefault: true },
    });
  }

  async getDefaultAddress(userId: string): Promise<UserAddress | null> {
    const defaultAddress = await this.prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      include: {
        region: true,
        city: true,
        commune: true,
      },
    });

    if (!defaultAddress) {
      return null;
    }

    return this.mapToUserAddress(defaultAddress);
  }

  private mapToUser(data: any): User {
    return new User(
      data.id,
      data.email,
      data.fullName?.split(' ')[0], // Approximation for firstName
      data.fullName?.split(' ').slice(1).join(' '), // Approximation for lastName
      data.phone237,
      data.role,
      true, // isEmailVerified - inferred as true since we don't store it
      data.createdAt,
      data.updatedAt,
      { loyaltyPoints: data.loyaltyPoints, preferredLang: data.preferredLang }
    );
  }

  private mapToUserAddress(data: any): UserAddress {
    const regionName = data.region?.name || '';
    const cityName = data.city?.name || '';
    const communeName = data.commune?.name || '';

    return new UserAddress(
      data.id.toString(),
      data.userId,
      AddressType.HOME, // Default to HOME as we don't store the type
      data.fullName?.split(' ')[0] || '', // Approximation for firstName
      data.fullName?.split(' ').slice(1).join(' ') || '', // Approximation for lastName
      data.phone || '',
      data.addressLine,
      undefined, // addressLine2 not stored separately
      cityName,
      regionName,
      '', // postalCode not stored
      data.country,
      data.isDefault,
      data.createdAt,
      data.updatedAt
    );
  }

  private buildAddressLine(address: any): string {
    // Construct a single address line from components
    return `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}`;
  }
}