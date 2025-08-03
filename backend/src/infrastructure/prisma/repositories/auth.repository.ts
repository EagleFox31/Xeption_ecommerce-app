import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AuthRepositoryPort } from "../../../domain/auth/auth.port";
import { UserProfile } from "../../../domain/auth/auth.entity";

@Injectable()
export class PrismaAuthRepository implements AuthRepositoryPort {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      return new UserProfile(
        user.id,
        user.email,
        // Split full name into first and last name components if available
        user.fullName?.split(' ')[0] || null,
        user.fullName?.split(' ').slice(1).join(' ') || null,
        user.phone237,
        // Map Prisma UserRole enum to domain roles
        this.mapRoleToUserRole(user.role.toString()),
        true, // Since we don't have an explicit email verification field, assume true
        user.createdAt,
        user.updatedAt,
        {
          loyaltyPoints: user.loyaltyPoints,
          preferredLang: user.preferredLang
        },
      );
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const userCount = await this.prisma.user.count({
        where: { id: userId },
      });
      
      return userCount > 0;
    } catch (error) {
      console.error("Error validating user exists:", error);
      return false;
    }
  }

  /**
   * Maps Prisma UserRole enum to domain roles
   */
  private mapRoleToUserRole(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'agent':
        return 'business'; // Map agent to business role in domain
      case 'client':
      default:
        return 'customer'; // Map client to customer role in domain
    }
  }
}