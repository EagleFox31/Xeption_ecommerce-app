import { Injectable } from "@nestjs/common";
import { ProductStockService } from "../../../domain/backorder/backorder.port";
import { PrismaService } from "../prisma.service";

/**
 * Prisma implementation of ProductStockService
 * Used for checking product stock levels and availability
 */
@Injectable()
export class PrismaProductStockService implements ProductStockService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check the current stock level of a product
   * @param productId Product ID to check
   * @returns Current stock quantity
   */
  async checkStockLevel(productId: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(productId) },
      select: { stockQty: true },
    });

    return product ? product.stockQty : 0;
  }

  /**
   * Get the creation date of the earliest ordered backorder for a product
   * @param productId Product ID to check
   * @returns Creation date or null if none found
   */
  async getEarliestOrderedBackorderDate(
    productId: string,
  ): Promise<Date | null> {
    const backOrder = await this.prisma.backOrder.findFirst({
      where: {
        productRef: productId,
        status: 'ordered',
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: { createdAt: true },
    });

    return backOrder ? backOrder.createdAt : null;
  }

  /**
   * Subscribe to stock updates for a product
   * In a real implementation, this would connect to an event system
   * @param productId Product ID to monitor
   * @param callback Function to call when stock changes
   */
  async subscribeToStockUpdates(
    productId: string,
    callback: (stock: number) => void,
  ): Promise<void> {
    // In a real implementation, this would register the callback with an event system
    // Such as Redis pub/sub, WebSockets, or a message queue
    
    // For now, we'll log the subscription but the actual event system
    // would need to be implemented separately
    console.log(`Subscribed to stock updates for product ${productId}`);
    
    // We could implement a polling mechanism here as a simple solution
    // or integrate with a proper event-driven architecture
  }
}
