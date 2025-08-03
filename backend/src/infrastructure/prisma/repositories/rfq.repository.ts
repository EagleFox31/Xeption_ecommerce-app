import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { RfqStatusEnum } from "@prisma/client";
import { RFQ, RFQRequest, RFQItem, RFQStatus } from "../../../domain/rfq/rfq.entity";
import { RFQRepository } from "../../../domain/rfq/rfq.port";

@Injectable()
export class PrismaRFQRepository implements RFQRepository {
  constructor(private prisma: PrismaService) {}

  // RFQ Requests
  async createRFQRequest(
    rfqRequest: Omit<RFQRequest, "id" | "submittedAt">
  ): Promise<RFQRequest> {
    // Note: Dans notre modèle, RFQRequest et RFQ sont confondus dans la même table
    // Nous utilisons donc la table Rfq pour stocker les deux

    const rfq = await this.prisma.rfq.create({
      data: {
        companyName: rfqRequest.companyName,
        contactName: rfqRequest.contactName,
        contactEmail: rfqRequest.contactEmail,
        budgetMinXaf: rfqRequest.budgetMinXaf,
        budgetMaxXaf: rfqRequest.budgetMaxXaf,
        isUrgent: rfqRequest.isUrgent || false,
        comment: rfqRequest.comment,
        deliveryDeadline: rfqRequest.deadline,
        createdBy: rfqRequest.createdBy,
        status: this.mapDomainStatusToPrisma(rfqRequest.rfqStatus),
      }
    });

    return this.mapPrismaToRFQRequest(rfq);
  }

  async getRFQRequestById(id: string): Promise<RFQRequest | null> {
    const rfq = await this.prisma.rfq.findUnique({
      where: { id }
    });

    if (!rfq) {
      return null;
    }

    return this.mapPrismaToRFQRequest(rfq);
  }

  async getUserRFQRequests(userId: string): Promise<RFQRequest[]> {
    const rfqs = await this.prisma.rfq.findMany({
      where: { createdBy: userId }
    });

    return rfqs.map(rfq => this.mapPrismaToRFQRequest(rfq));
  }

  async updateRFQRequest(
    id: string,
    updates: Partial<RFQRequest>
  ): Promise<RFQRequest> {
    const data: any = {};

    if (updates.companyName !== undefined) {
      data.companyName = updates.companyName;
    }

    if (updates.contactName !== undefined) {
      data.contactName = updates.contactName;
    }

    if (updates.contactEmail !== undefined) {
      data.contactEmail = updates.contactEmail;
    }

    if (updates.budgetMinXaf !== undefined) {
      data.budgetMinXaf = updates.budgetMinXaf;
    }

    if (updates.budgetMaxXaf !== undefined) {
      data.budgetMaxXaf = updates.budgetMaxXaf;
    }

    if (updates.isUrgent !== undefined) {
      data.isUrgent = updates.isUrgent;
    }

    if (updates.comment !== undefined) {
      data.comment = updates.comment;
    }

    if (updates.deadline !== undefined) {
      data.deliveryDeadline = updates.deadline;
    }

    if (updates.rfqStatus !== undefined) {
      data.rfqStatus = this.mapDomainStatusToPrisma(updates.rfqStatus);
    }

    const updatedRfq = await this.prisma.rfq.update({
      where: { id },
      data
    });

    return this.mapPrismaToRFQRequest(updatedRfq);
  }

  async deleteRFQRequest(id: string): Promise<void> {
    // Supprimer d'abord les items associés
    await this.prisma.rfqItem.deleteMany({
      where: { rfqId: id }
    });

    // Puis supprimer le RFQ lui-même
    await this.prisma.rfq.delete({
      where: { id }
    });
  }

  // RFQs - Dans notre modèle, RFQ et RFQRequest sont dans la même table
  async createRFQ(rfq: Omit<RFQ, "id" | "createdAt">): Promise<RFQ> {
    const newRfq = await this.prisma.rfq.create({
      data: {
        companyName: rfq.companyName,
        contactName: rfq.contactName,
        contactEmail: rfq.contactEmail,
        budgetMinXaf: rfq.budgetMinXaf,
        budgetMaxXaf: rfq.budgetMaxXaf,
        isUrgent: rfq.isUrgent || false,
        comment: rfq.comment,
        deliveryDeadline: rfq.deliveryDeadline,
        submittedAt: rfq.submittedAt,
        createdBy: rfq.createdBy,
        status: this.mapDomainStatusToPrisma(rfq.rfqStatus),
        answerDocUrl: rfq.answerDocUrl
      }
    });

    return this.mapPrismaToRFQ(newRfq);
  }

  async getRFQById(id: string): Promise<RFQ | null> {
    const rfq = await this.prisma.rfq.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!rfq) {
      return null;
    }

    return this.mapPrismaToRFQ(rfq);
  }

  async getAllRFQs(): Promise<RFQ[]> {
    const rfqs = await this.prisma.rfq.findMany({
      include: {
        items: true
      }
    });

    return rfqs.map(rfq => this.mapPrismaToRFQ(rfq));
  }

  async getRFQsByStatus(status: RFQStatus): Promise<RFQ[]> {
    const rfqs = await this.prisma.rfq.findMany({
      where: {
        status: this.mapDomainStatusToPrisma(status)
      },
      include: {
        items: true
      }
    });

    return rfqs.map(rfq => this.mapPrismaToRFQ(rfq));
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ> {
    const data: any = {};

    if (updates.companyName !== undefined) {
      data.companyName = updates.companyName;
    }

    if (updates.contactName !== undefined) {
      data.contactName = updates.contactName;
    }

    if (updates.contactEmail !== undefined) {
      data.contactEmail = updates.contactEmail;
    }

    if (updates.budgetMinXaf !== undefined) {
      data.budgetMinXaf = updates.budgetMinXaf;
    }

    if (updates.budgetMaxXaf !== undefined) {
      data.budgetMaxXaf = updates.budgetMaxXaf;
    }

    if (updates.status !== undefined) {
      data.status = this.mapDomainStatusToPrisma(updates.status);
    }

    if (updates.answerDocUrl !== undefined) {
      data.answerDocUrl = updates.answerDocUrl;
    }

    if (updates.isUrgent !== undefined) {
      data.isUrgent = updates.isUrgent;
    }

    if (updates.comment !== undefined) {
      data.comment = updates.comment;
    }

    if (updates.deliveryDeadline !== undefined) {
      data.deliveryDeadline = updates.deliveryDeadline;
    }

    if (updates.submittedAt !== undefined) {
      data.submittedAt = updates.submittedAt;
    }

    // Note: rfqStatus est redondant avec status, nous n'utilisons que status
    // Nous laissons cette vérification pour la compatibilité avec le code existant
    if (updates.rfqStatus !== undefined) {
      data.status = this.mapDomainStatusToPrisma(updates.rfqStatus);
    }

    const updatedRfq = await this.prisma.rfq.update({
      where: { id },
      data,
      include: {
        items: true
      }
    });

    return this.mapPrismaToRFQ(updatedRfq);
  }

  async assignRFQToAgent(rfqId: string, agentId: string): Promise<RFQ> {
    const updatedRfq = await this.prisma.rfq.update({
      where: { id: rfqId },
      data: {
        createdBy: agentId,
        status: this.mapDomainStatusToPrisma(RFQStatus.UNDER_REVIEW)
      },
      include: {
        items: true
      }
    });

    return this.mapPrismaToRFQ(updatedRfq);
  }

  // RFQ Items
  async createRFQItem(rfqItem: Omit<RFQItem, "id">): Promise<RFQItem> {
    const newItem = await this.prisma.rfqItem.create({
      data: {
        rfqId: rfqItem.rfqId,
        categoryId: BigInt(rfqItem.categoryId),
        qty: rfqItem.qty,
        specsNote: rfqItem.specsNote
      }
    });

    return this.mapPrismaToRFQItem(newItem);
  }

  async getRFQItems(rfqId: string): Promise<RFQItem[]> {
    const items = await this.prisma.rfqItem.findMany({
      where: { rfqId }
    });

    return items.map(item => this.mapPrismaToRFQItem(item));
  }

  async updateRFQItem(id: number, updates: Partial<RFQItem>): Promise<RFQItem> {
    const data: any = {};

    if (updates.categoryId !== undefined) {
      data.categoryId = BigInt(updates.categoryId);
    }

    if (updates.qty !== undefined) {
      data.qty = updates.qty;
    }

    if (updates.specsNote !== undefined) {
      data.specsNote = updates.specsNote;
    }

    const updatedItem = await this.prisma.rfqItem.update({
      where: { id: BigInt(id) },
      data
    });

    return this.mapPrismaToRFQItem(updatedItem);
  }

  async deleteRFQItem(id: number): Promise<void> {
    await this.prisma.rfqItem.delete({
      where: { id: BigInt(id) }
    });
  }

  // Méthodes utilitaires pour le mapping
  private mapPrismaToRFQRequest(rfq: any): RFQRequest {
    return {
      id: rfq.id,
      companyName: rfq.companyName,
      contactName: rfq.contactName,
      contactEmail: rfq.contactEmail,
      budgetMinXaf: rfq.budgetMinXaf ? Number(rfq.budgetMinXaf) : undefined,
      budgetMaxXaf: rfq.budgetMaxXaf ? Number(rfq.budgetMaxXaf) : undefined,
      isUrgent: rfq.isUrgent,
      comment: rfq.comment,
      deadline: rfq.deliveryDeadline,
      submittedAt: rfq.submittedAt || rfq.createdAt,
      createdBy: rfq.createdBy,
      rfqStatus: this.mapPrismaStatusToDomain(rfq.status)
    };
  }

  private mapPrismaToRFQ(rfq: any): RFQ {
    return {
      id: rfq.id,
      companyName: rfq.companyName,
      contactName: rfq.contactName,
      contactEmail: rfq.contactEmail,
      budgetMinXaf: rfq.budgetMinXaf ? Number(rfq.budgetMinXaf) : undefined,
      budgetMaxXaf: rfq.budgetMaxXaf ? Number(rfq.budgetMaxXaf) : undefined,
      status: this.mapPrismaStatusToDomain(rfq.status), // Utiliser status du prisma model
      answerDocUrl: rfq.answerDocUrl,
      createdAt: rfq.createdAt,
      isUrgent: rfq.isUrgent,
      comment: rfq.comment,
      deliveryDeadline: rfq.deliveryDeadline,
      submittedAt: rfq.submittedAt,
      createdBy: rfq.createdBy,
      // rfqStatus est le même que status, mais conservé pour la compatibilité avec le code existant
      rfqStatus: this.mapPrismaStatusToDomain(rfq.status)
    };
  }

  private mapPrismaToRFQItem(item: any): RFQItem {
    return {
      id: Number(item.id),
      rfqId: item.rfqId,
      categoryId: Number(item.categoryId),
      qty: item.qty,
      specsNote: item.specsNote
    };
  }

  private mapDomainStatusToPrisma(status: RFQStatus): RfqStatusEnum {
    switch (status) {
      case RFQStatus.DRAFT:
        return RfqStatusEnum.draft;
      case RFQStatus.NEW:
        return RfqStatusEnum.new;
      case RFQStatus.SUBMITTED:
        return RfqStatusEnum.submitted;
      case RFQStatus.UNDER_REVIEW:
        return RfqStatusEnum.under_review;
      case RFQStatus.ANSWERED:
        return RfqStatusEnum.answered;
      case RFQStatus.QUOTED:
        return RfqStatusEnum.quoted;
      case RFQStatus.APPROVED:
        return RfqStatusEnum.approved;
      case RFQStatus.REJECTED:
        return RfqStatusEnum.rejected;
      case RFQStatus.WON:
        return RfqStatusEnum.won;
      case RFQStatus.LOST:
        return RfqStatusEnum.lost;
      case RFQStatus.CLOSED:
        return RfqStatusEnum.closed;
      default:
        return RfqStatusEnum.draft;
    }
  }

  private mapPrismaStatusToDomain(status: RfqStatusEnum): RFQStatus {
    switch (status) {
      case RfqStatusEnum.draft:
        return RFQStatus.DRAFT;
      case RfqStatusEnum.new:
        return RFQStatus.NEW;
      case RfqStatusEnum.submitted:
        return RFQStatus.SUBMITTED;
      case RfqStatusEnum.under_review:
        return RFQStatus.UNDER_REVIEW;
      case RfqStatusEnum.answered:
        return RFQStatus.ANSWERED;
      case RfqStatusEnum.quoted:
        return RFQStatus.QUOTED;
      case RfqStatusEnum.approved:
        return RFQStatus.APPROVED;
      case RfqStatusEnum.rejected:
        return RFQStatus.REJECTED;
      case RfqStatusEnum.won:
        return RFQStatus.WON;
      case RfqStatusEnum.lost:
        return RFQStatus.LOST;
      case RfqStatusEnum.closed:
        return RFQStatus.CLOSED;
      default:
        return RFQStatus.DRAFT;
    }
  }
}