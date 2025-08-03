import { Injectable, Inject } from '@nestjs/common';
import { 
  AUTH_REPOSITORY, 
  AuthRepositoryPort,
  TokenInvalidException
} from '../../domain/auth/auth.port';

export interface LogoutCommand {
  refreshToken?: string;
  userId?: string;
  logoutFromAllDevices?: boolean;
}

export interface LogoutResult {
  success: boolean;
  message: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  async execute(command: LogoutCommand): Promise<LogoutResult> {
    try {
      // Validation des paramètres
      if (!command.refreshToken && !command.userId) {
        throw new TokenInvalidException('Refresh token ou userId requis pour la déconnexion');
      }

      if (command.logoutFromAllDevices && command.userId) {
        // Déconnexion de tous les appareils
        await this.authRepository.revokeAllRefreshTokensForUser(command.userId);
        return {
          success: true,
          message: 'Déconnexion réussie de tous les appareils',
        };
      }

      if (command.refreshToken) {
        // Déconnexion de l'appareil actuel uniquement
        await this.authRepository.revokeRefreshToken(command.refreshToken);
        return {
          success: true,
          message: 'Déconnexion réussie',
        };
      }

      // Cas par défaut - ne devrait pas arriver avec la validation ci-dessus
      throw new TokenInvalidException('Paramètres de déconnexion invalides');

    } catch (error) {
      // Gestion des erreurs - même en cas d'erreur, on considère la déconnexion comme réussie
      // pour des raisons de sécurité (ne pas révéler l'état des tokens)
      if (error instanceof TokenInvalidException) {
        return {
          success: true,
          message: 'Déconnexion effectuée',
        };
      }

      // Re-lancer les autres erreurs
      throw error;
    }
  }
}
