export interface JwtPayload {
  sub: string; // user id
  email: string;
  role?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
  metadata?: Record<string, any>;
}
