import { RFQ, RFQRequest, RFQItem, RFQStatus } from "./rfq.entity";

export const RFQ_REPOSITORY = Symbol('RFQRepositoryPort');

export interface RFQRepository {
  // RFQ Requests
  createRFQRequest(
    rfqRequest: Omit<RFQRequest, "id" | "submittedAt">,
  ): Promise<RFQRequest>;
  getRFQRequestById(id: string): Promise<RFQRequest | null>;
  getUserRFQRequests(userId: string): Promise<RFQRequest[]>;
  updateRFQRequest(
    id: string,
    updates: Partial<RFQRequest>,
  ): Promise<RFQRequest>;
  deleteRFQRequest(id: string): Promise<void>;

  // RFQs
  createRFQ(rfq: Omit<RFQ, "id" | "createdAt">): Promise<RFQ>;
  getRFQById(id: string): Promise<RFQ | null>;
  getAllRFQs(): Promise<RFQ[]>;
  getRFQsByStatus(status: RFQStatus): Promise<RFQ[]>;
  updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ>;
  assignRFQToAgent(rfqId: string, agentId: string): Promise<RFQ>;

  // RFQ Items
  createRFQItem(rfqItem: Omit<RFQItem, "id">): Promise<RFQItem>;
  getRFQItems(rfqId: string): Promise<RFQItem[]>;
  updateRFQItem(id: number, updates: Partial<RFQItem>): Promise<RFQItem>;
  deleteRFQItem(id: number): Promise<void>;
}
