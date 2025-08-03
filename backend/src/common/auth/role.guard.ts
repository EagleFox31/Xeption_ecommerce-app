import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AuthenticatedUser } from './jwt.types';

/**
 * Role-based access control guard
 * 
 * Works with the @Roles decorator to restrict endpoint access
 * based on user role. Should be used alongside AuthGuard.
 * 
 * @example
 * @Roles('admin')
 * @UseGuards(AuthGuard, RoleGuard)
 * @Get('admin/endpoint')
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from handler metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request object (set by AuthGuard)
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    // Ensure user exists and has a role
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User role not defined');
    }

    // Check if user has one of the required roles
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied: Required role is one of [${requiredRoles.join(', ')}]`
      );
    }

    return true;
  }
}