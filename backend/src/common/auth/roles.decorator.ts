import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator - Used to specify which roles have access to a route
 * 
 * @example
 * @Roles('admin')
 * @Get('admin/users')
 * getUsers() {}
 * 
 * @example - Multiple roles
 * @Roles('admin', 'agent')
 * @Get('admin/dashboard')
 * getDashboard() {}
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);