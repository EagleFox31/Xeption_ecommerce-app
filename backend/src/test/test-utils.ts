/**
 * Test Utilities for the Xeption Network Backend
 * 
 * This file contains common mocks and helpers for unit and integration tests.
 */

import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

/**
 * Create a mock ConfigService for testing
 */
export const createMockConfigService = () => ({
  get: jest.fn().mockImplementation((key: string) => {
    switch (key) {
      case 'NODE_ENV':
        return 'test';
      case 'JWT_SECRET':
        return 'test-secret';
      case 'DATABASE_URL':
        return 'postgresql://postgres:Postgresql@localhost:5432/xeption_test?schema=public';
      default:
        return null;
    }
  }),
});

/**
 * Create a mock AuthGuard for testing
 */
export class MockAuthGuard {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: UserRole.client,
    };
    return true;
  }
}

/**
 * Mock for the current user decorator
 */
export const mockCurrentUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: UserRole.client,
};

/**
 * Create a mock PrismaService for testing
 */
export const createMockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  cart: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  cartItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  orderItem: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback()),
});

/**
 * Mock request object for testing controllers
 */
export const createMockRequest = (user = mockCurrentUser) => ({
  user,
});

/**
 * Mock response object for testing controllers
 */
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};