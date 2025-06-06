/**
 * Use case pour récupérer les demandes de précommande d'un utilisateur
 * Gère la logique de filtrage et pagination
 */

import { Injectable } from "@nestjs/common";
import { BackorderRepository } from "../../domain/backorder/backorder.port";
import {
  BackorderRequest,
  BackorderStatus,
  BackorderPriority,
} from "../../domain/backorder/backorder.entity";

export interface GetUserBackorderRequestsInput {
  userId: string;
  filters?: {
    status?: BackorderStatus;
    priority?: BackorderPriority;
    productId?: string;
  };
  pagination?: {
    limit?: number;
    offset?: number;
  };
}

export interface GetUserBackorderRequestsOutput {
  requests: BackorderRequest[];
  total: number;
  hasMore: boolean;
}

@Injectable()
export class GetUserBackorderRequestsUseCase {
  constructor(private readonly backorderRepository: BackorderRepository) {}

  async execute(
    input: GetUserBackorderRequestsInput,
  ): Promise<GetUserBackorderRequestsOutput> {
    // Validation des données d'entrée
    if (!input.userId) {
      throw new Error("L'ID utilisateur est requis.");
    }

    // Définir les paramètres par défaut
    const limit = input.pagination?.limit || 20;
    const offset = input.pagination?.offset || 0;

    // Validation des paramètres de pagination
    if (limit <= 0 || limit > 100) {
      throw new Error("La limite doit être entre 1 et 100.");
    }

    if (offset < 0) {
      throw new Error("L'offset ne peut pas être négatif.");
    }

    // Récupérer les demandes avec filtres et pagination
    const requests = await this.backorderRepository.getUserBackorderRequests(
      input.userId,
      {
        ...input.filters,
        limit: limit + 1, // +1 pour déterminer s'il y a plus de résultats
        offset,
      },
    );

    // Déterminer s'il y a plus de résultats
    const hasMore = requests.length > limit;
    const actualRequests = hasMore ? requests.slice(0, limit) : requests;

    // Calculer le total (approximatif pour les performances)
    const total = offset + actualRequests.length + (hasMore ? 1 : 0);

    return {
      requests: actualRequests,
      total,
      hasMore,
    };
  }
}
