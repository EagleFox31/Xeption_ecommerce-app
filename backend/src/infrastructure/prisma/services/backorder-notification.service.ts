import { Injectable } from "@nestjs/common";
import { BackorderNotificationService } from "../../../domain/backorder/backorder.port";
import { BackorderRequest, ProductAvailability } from "../../../domain/backorder/backorder.entity";
import { PrismaService } from "../prisma.service";

/**
 * Prisma implementation of BackorderNotificationService
 * Handles sending notifications to users about backorder status changes
 */
@Injectable()
export class PrismaBackorderNotificationService implements BackorderNotificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Send a notification to the user when their requested product becomes available
   * @param backorderRequest The backorder request
   * @param productAvailability Product availability information
   */
  async sendAvailabilityNotification(
    backorderRequest: BackorderRequest,
    productAvailability: ProductAvailability,
  ): Promise<void> {
    // Create a notification record in the database
    await this.prisma.backOrderNotification.create({
      data: {
        backOrderId: backorderRequest.id,
        productId: BigInt(productAvailability.productId),
        notifiedBy: backorderRequest.userId, // This could be changed to the system user or admin ID
      },
    });

    // In a real implementation, this would also:
    // 1. Send an email notification using a mail service
    // 2. Send an SMS if user has opted for it
    // 3. Create a push notification if applicable
    
    // For now, we'll just log it
    console.log(`Sending availability notification for request ${backorderRequest.id}`);
    
    // Update the backorder request status to notified
    await this.prisma.backOrder.update({
      where: { id: backorderRequest.id },
      data: { 
        notificationSent: true,
        // If we had the correct enum mapping, we could update status too
        // For now, we'll assume statuses don't perfectly match
      },
    });
  }

  /**
   * Send a notification to the user when their backorder status changes
   * @param backorderRequest The updated backorder request
   */
  async sendStatusUpdateNotification(backorderRequest: BackorderRequest): Promise<void> {
    // Create a notification record in the database
    await this.prisma.backOrderNotification.create({
      data: {
        backOrderId: backorderRequest.id,
        notifiedBy: backorderRequest.userId, // This could be changed to the system user or admin ID
      },
    });

    // In a real implementation, this would send notifications via:
    // - Email
    // - SMS (if enabled)
    // - Push notification (if enabled)
    
    console.log(`Sending status update notification for request ${backorderRequest.id}`);
  }

  /**
   * Send a notification to the user when the price of their requested product changes
   * @param backorderRequest The backorder request
   * @param newPrice The new price of the product
   */
  async sendPriceChangeNotification(
    backorderRequest: BackorderRequest,
    newPrice: number,
  ): Promise<void> {
    // Create a notification record in the database
    await this.prisma.backOrderNotification.create({
      data: {
        backOrderId: backorderRequest.id,
        notifiedBy: backorderRequest.userId, // This could be changed to the system user or admin ID
      },
    });

    // In a real implementation, this would send price change alerts
    // The notification should include both the old and new price
    // This allows users to make informed decisions about their backorders
    
    console.log(`Sending price change notification for request ${backorderRequest.id}`);
    
    // If the price exceeds user's maxPrice, we might want to add special handling
    if (backorderRequest.maxPrice && newPrice > backorderRequest.maxPrice) {
      console.log(`Price ${newPrice} exceeds user's max budget of ${backorderRequest.maxPrice}`);
      // Additional logic for when price exceeds budget could be implemented here
    }
  }
}