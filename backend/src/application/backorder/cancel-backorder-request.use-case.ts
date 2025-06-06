/**
 * Use case pour annuler une demande de précommande
 * Gère la logique d'annulation avec validation
 */

import { Injectable } from "@nestjs/common";
import { BackorderRepository } from "../../domain/backorder/backorder.port";
import {
  BackorderRequest,
  BackorderStatus,
} from "../../domain/backorder/backorder.entity";

export interface CancelBackorderRequestInput {
  requestId: string;
  userId: string;
  reason?: string;
}

@Injectable()
export class CancelBackorderRequestUseCase {
  constructor(private readonly backorderRepository: BackorderRepository) {}

  async execute(input: CancelBackorderRequestInput): Promise<BackorderRequest> {
    // Validation des données d'entrée
    if (!input.requestId) {
      throw new Error("L'ID de la demande est requis.");
    }

    if (!input.userId) {
      throw new Error("L'ID utilisateur est requis.");
    }

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

    // Vérifier si la demande peut être annulée
    if (existingRequest.status === BackorderStatus.FULFILLED) {
      throw new Error("Impossible d'annuler une demande déjà satisfaite.");
    }

    if (existingRequest.status === BackorderStatus.CANCELLED) {
      throw new Error("Cette demande est déjà annulée.");
    }

    // Annuler la demande
    const cancelledRequest =
      await this.backorderRepository.updateBackorderRequest(input.requestId, {
        status: BackorderStatus.CANCELLED,
        notes: input.reason
          ? `${existingRequest.notes || ""} [Annulé: ${input.reason}]`
          : existingRequest.notes,
        updatedAt: new Date(),
      });

    return cancelledRequest;
  }
}
