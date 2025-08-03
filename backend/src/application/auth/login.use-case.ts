import { Injectable, Inject } from '@nestjs/common';
import { 
  AUTH_REPOSITORY, 
  JWT_SERVICE,
  AuthRepositoryPort,
  JwtServicePort,
  LoginCommand,
  LoginResult,
  JwtPayload,
  InvalidCredentialsException,
  InvalidEmailException
} from '../../domain/auth/auth.port';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(JWT_SERVICE)
    private readonly jwtService: JwtServicePort,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    try {
      // Validation des données d'entrée
      this.validateCommand(command);

      // Valider les credentials via le repository
      const user = await this.authRepository.validateCredentials(command);

      // Créer le payload JWT
      const jwtPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      // Générer les tokens
      const accessToken = this.jwtService.generateAccessToken(jwtPayload);
      const refreshToken = this.jwtService.generateRefreshToken(jwtPayload);

      // Stocker le refresh token
      const refreshTokenTTL = this.jwtService.getRefreshTokenTTL();
      const expiresAt = new Date(Date.now() + refreshTokenTTL * 1000);
      await this.authRepository.storeRefreshToken(user.id, refreshToken, expiresAt);

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      };

    } catch (error) {
      // Gestion unifiée des erreurs d'authentification
      if (error instanceof InvalidCredentialsException || 
          error instanceof InvalidEmailException) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
          },
        };
      }

      // Re-lancer les autres erreurs
      throw error;
    }
  }

  private validateCommand(command: LoginCommand): void {
    // Validation de l'email
    if (!command.email || !this.isValidEmail(command.email)) {
      throw new InvalidEmailException('Format d\'email invalide');
    }

    // Validation du mot de passe
    if (!command.password || command.password.trim().length === 0) {
      throw new InvalidCredentialsException('Le mot de passe est requis');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
