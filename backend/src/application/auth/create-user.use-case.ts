import { Injectable, Inject } from '@nestjs/common';
import { 
  AUTH_REPOSITORY, 
  PASSWORD_SERVICE,
  AuthRepositoryPort,
  PasswordServicePort,
  CreateUserCommand,
  UserExistsException,
  InvalidEmailException,
  InvalidPasswordException,
  InvalidPhoneException,
  InvalidRoleException
} from '../../domain/auth/auth.port';
import { UserProfile } from '../../domain/auth/auth.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: PasswordServicePort,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserProfile> {
    // Validation des données d'entrée
    this.validateCommand(command);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.authRepository.findUserByEmail(command.email);
    if (existingUser) {
      throw new UserExistsException(`Un utilisateur avec l'email ${command.email} existe déjà`);
    }

    // Hasher le mot de passe
    const hashedPassword = await this.passwordService.hash(command.password);

    // Créer la commande avec le mot de passe hashé
    const commandWithHashedPassword: CreateUserCommand = {
      ...command,
      password: hashedPassword,
    };

    // Créer l'utilisateur
    return await this.authRepository.createUser(commandWithHashedPassword);
  }

  private validateCommand(command: CreateUserCommand): void {
    // Validation de l'email
    if (!command.email || !this.isValidEmail(command.email)) {
      throw new InvalidEmailException('Format d\'email invalide');
    }

    // Validation du mot de passe
    if (!command.password || command.password.length < 8) {
      throw new InvalidPasswordException('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!this.hasValidPasswordComplexity(command.password)) {
      throw new InvalidPasswordException('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
    }

    // Validation du nom complet
    if (!command.fullName || command.fullName.trim().length < 2) {
      throw new InvalidPasswordException('Le nom complet doit contenir au moins 2 caractères');
    }

    // Validation du téléphone camerounais
    if (!command.phone237 || !this.isValidCameroonPhone(command.phone237)) {
      throw new InvalidPhoneException('Numéro de téléphone camerounais invalide (format attendu: +237XXXXXXXXX)');
    }

    // Validation du rôle
    if (command.role && !['client', 'agent', 'admin'].includes(command.role)) {
      throw new InvalidRoleException('Rôle invalide. Valeurs acceptées: client, agent, admin');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private hasValidPasswordComplexity(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers;
  }

  private isValidCameroonPhone(phone: string): boolean {
    // Format camerounais : +237XXXXXXXXX ou 237XXXXXXXXX ou 6XXXXXXXX ou 7XXXXXXXX
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(\+?237)?[67]\d{8}$/;
    return phoneRegex.test(cleanPhone);
  }
}
