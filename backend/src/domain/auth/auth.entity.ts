export class UserProfile {
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

export interface AuthValidationResult {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}
