import { UserProfile } from "./auth.entity";

/**
 * Injection tokens
 */
export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
export const JWT_SERVICE = 'JWT_SERVICE';
export const PASSWORD_SERVICE = 'PASSWORD_SERVICE';

/**
 * DTOs and Commands
 */
export interface CreateUserCommand {
  email: string;
  password: string;
  fullName: string;
  phone237: string;
  role?: 'client' | 'agent' | 'admin';
  preferredLang?: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface LoginResult {
  success: boolean;
  user?: UserProfile;
  accessToken?: string;
  refreshToken?: string;
  error?: AuthError;
}

export interface RefreshTokenResult {
  success: boolean;
  accessToken?: string;
  error?: AuthError;
}

/**
 * Error types
 */
export interface AuthError {
  type: 'INVALID_CREDENTIALS' | 'USER_EXISTS' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'USER_NOT_FOUND';
  message: string;
}

/**
 * Auth Exceptions
 */
export abstract class AuthException extends Error {
  abstract readonly type: AuthError['type'];
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsException extends AuthException {
  readonly type = 'INVALID_CREDENTIALS';
}

export class UserExistsException extends AuthException {
  readonly type = 'USER_EXISTS';
}

export class TokenExpiredException extends AuthException {
  readonly type = 'TOKEN_EXPIRED';
}

export class TokenInvalidException extends AuthException {
  readonly type = 'TOKEN_INVALID';
}

export class UserNotFoundException extends AuthException {
  readonly type = 'USER_NOT_FOUND';
}

export class InvalidEmailException extends AuthException {
  readonly type = 'INVALID_CREDENTIALS';
}

export class InvalidPasswordException extends AuthException {
  readonly type = 'INVALID_CREDENTIALS';
}

export class InvalidPhoneException extends AuthException {
  readonly type = 'INVALID_CREDENTIALS';
}

export class InvalidRoleException extends AuthException {
  readonly type = 'INVALID_CREDENTIALS';
}

/**
 * Repository Port - Gestion de la persistance
 */
export interface AuthRepositoryPort {
  findUserByEmail(email: string): Promise<UserProfile | null>;
  getUserProfile(userId: string): Promise<UserProfile>; // throw UserNotFoundException
  createUser(cmd: CreateUserCommand): Promise<UserProfile>; // throw UserExistsException
  validateCredentials(cmd: LoginCommand): Promise<UserProfile>; // throw InvalidCredentialsException
  storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  validateRefreshToken(token: string): Promise<{ userId: string }>; // throw TokenExpiredException | TokenInvalidException
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllRefreshTokensForUser(userId: string): Promise<void>;
}

/**
 * JWT Service Port - Gestion des tokens
 */
export interface JwtServicePort {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  validateAccessToken(token: string): JwtPayload; // throw TokenInvalidException | TokenExpiredException
  getRefreshTokenTTL(): number; // en secondes
}

/**
 * Password Service Port - Gestion des mots de passe
 */
export interface PasswordServicePort {
  hash(password: string): Promise<string>;
  verify(password: string, hashedPassword: string): Promise<boolean>;
}
