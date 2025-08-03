import { Injectable, LoggerService } from '@nestjs/common';

/**
 * Service de journalisation personnalisé pour Xeption
 * Permet une journalisation structurée avec différents niveaux de logs
 */
@Injectable()
export class CustomLoggerService implements LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Formatte un message de log avec contexte et timestamp
   */
  private formatMessage(message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    return `[${timestamp}] [${ctx}] ${message}`;
  }

  /**
   * Log informationnel standard
   */
  log(message: string, context?: string) {
    console.log(this.formatMessage(message, context));
  }

  /**
   * Log d'erreur
   */
  error(message: string, trace?: string, context?: string) {
    console.error(this.formatMessage(`❌ ERROR: ${message}`, context));
    if (trace) {
      console.error(trace);
    }
  }

  /**
   * Log d'avertissement
   */
  warn(message: string, context?: string) {
    console.warn(this.formatMessage(`⚠️ WARNING: ${message}`, context));
  }

  /**
   * Log de débogage
   */
  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      console.debug(this.formatMessage(`🔍 DEBUG: ${message}`, context));
    }
  }

  /**
   * Log détaillé pour environnement de développement
   */
  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'verbose') {
      console.log(this.formatMessage(`📝 VERBOSE: ${message}`, context));
    }
  }

  /**
   * Crée une nouvelle instance du logger avec un contexte spécifique
   */
  static forContext(context: string): CustomLoggerService {
    return new CustomLoggerService(context);
  }
}