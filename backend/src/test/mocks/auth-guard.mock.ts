import { ExecutionContext } from '@nestjs/common';

export class MockAuthGuard {
  canActivate(context: ExecutionContext) {
    return true; // Always allow access during tests
  }
}

export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    // Return appropriate mock values based on the key
    if (key === 'jwt.secret') return 'test-secret';
    if (key === 'jwt.expiresIn') return '1h';
    return null;
  }),
};