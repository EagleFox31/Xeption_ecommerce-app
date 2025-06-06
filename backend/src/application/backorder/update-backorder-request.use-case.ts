/**
 * Use case pour mettre à jour une demande de précommande
 * Gère la logique de mise à jour avec validation
 */

import { Injectable } from "@nestjs/common";
import { BackorderRepository } from "../../domain/backorder/backorder.port";
import {
  BackorderRequest,
  BackorderStatus,
  BackorderPriority,
} from "../../domain/backorder/backorder.entity";

export interface UpdateBackorderRequestInput {
  requestId: string;
  userId: string;
  updates: {
    quantity?: number;
    maxPrice?: number;
    priority?: BackorderPriority;
    status?: BackorderStatus;
    notificationPreferences?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    notes?: string;
  };
}

@Injectable()
export class UpdateBackorderRequestUseCase {
  constructor(private readonly backorderRepository: BackorderRepository) {}

  async execute(input: UpdateBackorderRequestInput): Promise<BackorderRequest> {
    // Validation des données d'entrée
    this.validateInput(input);

    // Récupérer la demande existante
    const existingRequest =
      await this.backorderRepository.getBackorderRequestById(input.requestId);

    if (!existingRequest) {
      throw new Error("Demande de précommande non trouvée.");
    }

    // Vérifier l'autorisation
    if (existingRequest.userId !== input.userId) {
      throw new Error("Accès non autorisé à cette demande de précommande.");
    }

    // Vérifier si la demande peut être modifiée
    if (existingRequest.status === BackorderStatus.FULFILLED) {
      throw new Error("Impossible de modifier une demande déjà satisfaite.");
    }

    if (existingRequest.status === BackorderStatus.CANCELLED) {
      throw new Error("Impossible de modifier une demande annulée.");
    }

    // Valider les mises à jour spécifiques
    this.validateUpdates(input.updates);

    // Appliquer les mises à jour
    const updatedRequest =
      await this.backorderRepository.updateBackorderRequest(input.requestId, {
        ...input.updates,
        updatedAt: new Date(),
      });

    return updatedRequest;
  }

  private validateInput(input: UpdateBackorderRequestInput): void {
    if (!input.requestId) {
      throw new Error("L'ID de la demande est requis.");
    }

    if (!input.userId) {
      throw new Error("L'ID utilisateur est requis.");
    }

    if (!input.updates || Object.keys(input.updates).length === 0) {
      throw new Error("Au moins une mise à jour doit être fournie.");
    }
  }

  private validateUpdates(
    updates: UpdateBackorderRequestInput["updates"],
  ): void {
    if (updates.quantity !== undefined && updates.quantity <= 0) {
      throw new Error("La quantité doit être supérieure à 0.");
    }

    if (updates.maxPrice !== undefined && updates.maxPrice <= 0) {
      throw new Error("Le prix maximum doit être supérieur à 0.");
    }

    if (updates.notificationPreferences) {
      const hasNotificationMethod = Object.values(
        updates.notificationPreferences,
      ).some(Boolean);
      if (!hasNotificationMethod) {
        throw new Error(
          "Au moins une méthode de notification doit être activée.",
        );
      }
    }
  }
}
