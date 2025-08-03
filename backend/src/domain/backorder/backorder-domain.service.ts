import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_STOCK_SERVICE,
  BACKORDER_NOTIFICATION_SERVICE,
  ProductStockService,
  BackorderNotificationService,
} from "./backorder.port";
import { BackorderRequest } from "./backorder.entity";

/**
 * Domain service handling business rules for backorders
 */
@Injectable()
export class BackorderDomainService {
  constructor(
    @Inject(PRODUCT_STOCK_SERVICE)
    private readonly productStockService: ProductStockService,
    @Inject(BACKORDER_NOTIFICATION_SERVICE)
    private readonly notificationService: BackorderNotificationService,
  ) {}

  /**
   * Determine if a price change exceeds the user's maximum budget
   */
  priceExceedsMax(backorderRequest: BackorderRequest, newPrice: number): boolean {
    return (
      backorderRequest.maxPrice !== undefined &&
      newPrice > backorderRequest.maxPrice
    );
  }

  /**
   * Handle a price change notification applying business rules
   */
  async handlePriceChange(
    backorderRequest: BackorderRequest,
    newPrice: number,
  ): Promise<void> {
    if (this.priceExceedsMax(backorderRequest, newPrice)) {
      console.log(
        `Price ${newPrice} exceeds user's max budget of ${backorderRequest.maxPrice}`,
      );
    }

    await this.notificationService.sendPriceChangeNotification(
      backorderRequest,
      newPrice,
    );
  }

  /**
   * Compute the expected restock date based on earliest ordered backorder
   */
  async getExpectedRestockDate(productId: string): Promise<Date | null> {
    const orderedDate =
      await this.productStockService.getEarliestOrderedBackorderDate(productId);
    if (!orderedDate) {
      return null;
    }

    const estimated = new Date(orderedDate);
    estimated.setDate(estimated.getDate() + 14);
    return estimated;
  }
}
