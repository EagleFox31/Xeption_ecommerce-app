/**
 * Use case pour récupérer une demande de précommande
 * Gère la logique de récupération avec vérifications d'autorisation
 */

import { Injectable } from "@nestjs/common";
import { BackorderRepository } from "../../domain/backorder/backorder.port";
import { BackorderRequest } from "../../domain/backorder/backorder.entity";

export interface GetBackorderRequestInput {
  requestId: string;
  userId: string; // Pour vérifier l'autorisation
}

@Injectable()
export class GetBackorderRequestUseCase {
  constructor(private readonly backorderRepository: BackorderRepository) {}

  async execute(input: GetBackorderRequestInput): Promise<BackorderRequest> {
    // Validation des données d'entrée
    if (!input.requestId) {
      throw new Error("L'ID de la demande est requis.");
    }

    if (!input.userId) {
      throw new Error("L'ID utilisateur est requis.");
    }

    // Récupérer la demande de précommande
    const backorderRequest =
      await this.backorderRepository.getBackorderRequestById(input.requestId);

    if (!backorderRequest) {
      throw new Error("Demande de précommande non trouvée.");
    }

    // Vérifier que l'utilisateur a le droit d'accéder à cette demande
    if (backorderRequest.userId !== input.userId) {
      throw new Error("Accès non autorisé à cette demande de précommande.");
    }

    return backorderRequest;
  }
}
