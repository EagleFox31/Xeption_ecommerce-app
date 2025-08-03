import { Injectable, Inject } from '@nestjs/common';
import { 
  AUTH_REPOSITORY, 
  JWT_SERVICE,
  AuthRepositoryPort,
  JwtServicePort,
  RefreshTokenResult,
  JwtPayload,
  TokenExpiredException,
  TokenInvalidException,
  UserNotFoundException
} from '../../domain/auth/auth.port';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(JWT_SERVICE)
    private readonly jwtService: JwtServicePort,
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      // Validation du token de base
      if (!refreshToken || refreshToken.trim().length === 0) {
        throw new TokenInvalidException('Refresh token manquant');
      }

      // Valider le refresh token dans la base de données
      const tokenData = await this.authRepository.validateRefreshToken(refreshToken);

      // Récupérer le profil utilisateur
      const user = await this.authRepository.getUserProfile(tokenData.userId);

      // Créer un nouveau payload JWT
      const jwtPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      // Générer un nouveau access token
      const newAccessToken = this.jwtService.generateAccessToken(jwtPayload);

      return {
        success: true,
        accessToken: newAccessToken,
      };

    } catch (error) {
      // Gestion unifiée des erreurs de token
      if (error instanceof TokenExpiredException || 
          error instanceof TokenInvalidException ||
          error instanceof UserNotFoundException) {
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
}
