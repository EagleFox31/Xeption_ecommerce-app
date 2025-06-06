export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phone?: string,
    public readonly role?: string,
    public readonly isEmailVerified?: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly metadata?: Record<string, any>,
  ) {}

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || this.email;
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  isBusiness(): boolean {
    return this.role === "business";
  }

  isCustomer(): boolean {
    return this.role === "customer" || !this.role;
  }
}

export class UserAddress {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: AddressType,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string,
    public readonly addressLine1: string,
    public readonly addressLine2?: string,
    public readonly city: string,
    public readonly region: string,
    public readonly postalCode?: string,
    public readonly country: string = "CM", // Cameroon by default
    public readonly isDefault: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  get fullAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.region,
      this.postalCode,
      this.country,
    ].filter(Boolean);
    return parts.join(", ");
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export enum AddressType {
  HOME = "home",
  WORK = "work",
  OTHER = "other",
}

export interface CreateAddressDto {
  type: AddressType;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  type?: AddressType;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}
