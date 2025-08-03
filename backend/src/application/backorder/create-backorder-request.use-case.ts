/**
 * Use case pour créer une demande de précommande
 * Gère la logique métier de création avec validation
 */

import { Injectable, Inject } from "@nestjs/common";
import {
  BackorderRepository,
  ProductStockService,
  BACKORDER_REPOSITORY,
  PRODUCT_STOCK_SERVICE,
} from "../../domain/backorder/backorder.port";
import { BackorderDomainService } from "../../domain/backorder/backorder-domain.service";
import {
  BackorderRequest,
  BackorderStatus,
  BackorderPriority,
} from "../../domain/backorder/backorder.entity";

export interface CreateBackorderRequestInput {
  userId: string;
  productId: string;
  quantity: number;
  maxPrice?: number;
  priority?: BackorderPriority;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  notes?: string;
}

@Injectable()
export class CreateBackorderRequestUseCase {
  constructor(
    @Inject(BACKORDER_REPOSITORY)
    private readonly backorderRepository: BackorderRepository,
    @Inject(PRODUCT_STOCK_SERVICE)
    private readonly productStockService: ProductStockService,
    private readonly backorderDomainService: BackorderDomainService,
  ) {}

  async execute(input: CreateBackorderRequestInput): Promise<BackorderRequest> {
    // Validation des données d'entrée
    this.validateInput(input);

    // Vérifier si le produit existe et son stock actuel
    const currentStock = await this.productStockService.checkStockLevel(
      input.productId,
    );

    if (currentStock >= input.quantity) {
      throw new Error(
        "Le produit est actuellement en stock. Aucune précommande nécessaire.",
      );
    }

    // Vérifier s'il existe déjà une demande similaire pour cet utilisateur
    const existingRequests =
      await this.backorderRepository.getUserBackorderRequests(input.userId, {
        productId: input.productId,
        status: BackorderStatus.PENDING,
      });

    if (existingRequests.length > 0) {
      throw new Error(
        "Une demande de précommande existe déjà pour ce produit.",
      );
    }

    // Obtenir la date de réapprovisionnement estimée
    const expectedRestockDate =
      await this.backorderDomainService.getExpectedRestockDate(
        input.productId,
      );

    // Créer la demande de précommande
    const backorderRequest =
      await this.backorderRepository.createBackorderRequest({
        userId: input.userId,
        productId: input.productId,
        quantity: input.quantity,
        maxPrice: input.maxPrice,
        priority: input.priority || BackorderPriority.MEDIUM,
        status: BackorderStatus.PENDING,
        notificationPreferences: input.notificationPreferences,
        expectedDeliveryDate: expectedRestockDate,
        notes: input.notes,
      });

    // S'abonner aux mises à jour de stock pour ce produit
    await this.productStockService.subscribeToStockUpdates(
      input.productId,
      (stock: number) => this.handleStockUpdate(backorderRequest.id, stock),
    );

    return backorderRequest;
  }

  private validateInput(input: CreateBackorderRequestInput): void {
    if (!input.userId || !input.productId) {
      throw new Error("UserId et ProductId sont requis.");
    }

    if (!input.quantity || input.quantity <= 0) {
      throw new Error("La quantité doit être supérieure à 0.");
    }

    if (input.maxPrice && input.maxPrice <= 0) {
      throw new Error("Le prix maximum doit être supérieur à 0.");
    }

    if (!input.notificationPreferences) {
      throw new Error("Les préférences de notification sont requises.");
    }

    const hasNotificationMethod = Object.values(
      input.notificationPreferences,
    ).some(Boolean);
    if (!hasNotificationMethod) {
      throw new Error(
        "Au moins une méthode de notification doit être activée.",
      );
    }
  }

  private async handleStockUpdate(
    backorderRequestId: string,
    newStock: number,
  ): Promise<void> {
    const request =
      await this.backorderRepository.getBackorderRequestById(
        backorderRequestId,
      );

    if (
      request &&
      newStock >= request.quantity &&
      request.status === BackorderStatus.PENDING
    ) {
      await this.backorderRepository.updateBackorderRequest(
        backorderRequestId,
        {
          status: BackorderStatus.NOTIFIED,
          updatedAt: new Date(),
        },
      );
    }
  }
}
