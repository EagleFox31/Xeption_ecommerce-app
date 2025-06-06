export interface RFQRequest {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  budgetMinXaf?: number;
  budgetMaxXaf?: number;
  isUrgent: boolean;
  comment?: string;
  deadline?: Date;
  submittedAt: Date;
  createdBy?: string;
  rfqStatus: RFQStatus;
}

export interface RFQ {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  budgetMinXaf?: number;
  budgetMaxXaf?: number;
  status: RFQStatus;
  answerDocUrl?: string;
  createdAt: Date;
  isUrgent: boolean;
  comment?: string;
  deliveryDeadline?: Date;
  submittedAt?: Date;
  createdBy?: string;
  rfqStatus: RFQStatus;
}

export interface RFQItem {
  id: number;
  rfqId: string;
  categoryId: number;
  qty: number;
  specsNote?: string;
}

export enum RFQStatus {
  DRAFT = "draft",
  NEW = "new",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  ANSWERED = "answered",
  QUOTED = "quoted",
  APPROVED = "approved",
  REJECTED = "rejected",
  WON = "won",
  LOST = "lost",
  CLOSED = "closed",
}
