import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { RFQRepository } from "../../../domain/rfq/rfq.port";
import {
  RFQ,
  RFQRequest,
  RFQItem,
  RFQStatus,
} from "../../../domain/rfq/rfq.entity";

@Injectable()
export class SupabaseRFQRepository implements RFQRepository {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>("SUPABASE_URL"),
      this.configService.get<string>("SUPABASE_SERVICE_KEY"),
    );
  }

  // RFQ Requests
  async createRFQRequest(
    rfqRequest: Omit<RFQRequest, "id" | "submittedAt">,
  ): Promise<RFQRequest> {
    const { data, error } = await this.supabase
      .from("rfq_requests")
      .insert({
        company_name: rfqRequest.companyName,
        contact_name: rfqRequest.contactName,
        contact_email: rfqRequest.contactEmail,
        budget_min_xaf: rfqRequest.budgetMinXaf,
        budget_max_xaf: rfqRequest.budgetMaxXaf,
        is_urgent: rfqRequest.isUrgent,
        comment: rfqRequest.comment,
        deadline: rfqRequest.deadline?.toISOString(),
        created_by: rfqRequest.createdBy,
        rfq_status: rfqRequest.rfqStatus,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create RFQ request: ${error.message}`);

    return this.mapRFQRequestFromDB(data);
  }

  async getRFQRequestById(id: string): Promise<RFQRequest | null> {
    const { data, error } = await this.supabase
      .from("rfq_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get RFQ request: ${error.message}`);
    }

    return this.mapRFQRequestFromDB(data);
  }

  async getUserRFQRequests(userId: string): Promise<RFQRequest[]> {
    const { data, error } = await this.supabase
      .from("rfq_requests")
      .select("*")
      .eq("created_by", userId)
      .order("submitted_at", { ascending: false });

    if (error)
      throw new Error(`Failed to get user RFQ requests: ${error.message}`);

    return data.map(this.mapRFQRequestFromDB);
  }

  async updateRFQRequest(
    id: string,
    updates: Partial<RFQRequest>,
  ): Promise<RFQRequest> {
    const updateData: any = {};

    if (updates.companyName) updateData.company_name = updates.companyName;
    if (updates.contactName) updateData.contact_name = updates.contactName;
    if (updates.contactEmail) updateData.contact_email = updates.contactEmail;
    if (updates.budgetMinXaf !== undefined)
      updateData.budget_min_xaf = updates.budgetMinXaf;
    if (updates.budgetMaxXaf !== undefined)
      updateData.budget_max_xaf = updates.budgetMaxXaf;
    if (updates.isUrgent !== undefined) updateData.is_urgent = updates.isUrgent;
    if (updates.comment !== undefined) updateData.comment = updates.comment;
    if (updates.deadline !== undefined)
      updateData.deadline = updates.deadline?.toISOString();
    if (updates.rfqStatus) updateData.rfq_status = updates.rfqStatus;

    const { data, error } = await this.supabase
      .from("rfq_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update RFQ request: ${error.message}`);

    return this.mapRFQRequestFromDB(data);
  }

  async deleteRFQRequest(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("rfq_requests")
      .delete()
      .eq("id", id);

    if (error)
      throw new Error(`Failed to delete RFQ request: ${error.message}`);
  }

  // RFQs
  async createRFQ(rfq: Omit<RFQ, "id" | "createdAt">): Promise<RFQ> {
    const { data, error } = await this.supabase
      .from("rfqs")
      .insert({
        company_name: rfq.companyName,
        contact_name: rfq.contactName,
        contact_email: rfq.contactEmail,
        budget_min_xaf: rfq.budgetMinXaf,
        budget_max_xaf: rfq.budgetMaxXaf,
        status: rfq.status,
        answer_doc_url: rfq.answerDocUrl,
        is_urgent: rfq.isUrgent,
        comment: rfq.comment,
        delivery_deadline: rfq.deliveryDeadline?.toISOString(),
        submitted_at: rfq.submittedAt?.toISOString(),
        created_by: rfq.createdBy,
        rfq_status: rfq.rfqStatus,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create RFQ: ${error.message}`);

    return this.mapRFQFromDB(data);
  }

  async getRFQById(id: string): Promise<RFQ | null> {
    const { data, error } = await this.supabase
      .from("rfqs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get RFQ: ${error.message}`);
    }

    return this.mapRFQFromDB(data);
  }

  async getAllRFQs(): Promise<RFQ[]> {
    const { data, error } = await this.supabase
      .from("rfqs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to get all RFQs: ${error.message}`);

    return data.map(this.mapRFQFromDB);
  }

  async getRFQsByStatus(status: RFQStatus): Promise<RFQ[]> {
    const { data, error } = await this.supabase
      .from("rfqs")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`Failed to get RFQs by status: ${error.message}`);

    return data.map(this.mapRFQFromDB);
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ> {
    const updateData: any = {};

    if (updates.status) updateData.status = updates.status;
    if (updates.answerDocUrl !== undefined)
      updateData.answer_doc_url = updates.answerDocUrl;
    if (updates.comment !== undefined) updateData.comment = updates.comment;
    if (updates.deliveryDeadline !== undefined)
      updateData.delivery_deadline = updates.deliveryDeadline?.toISOString();
    if (updates.rfqStatus) updateData.rfq_status = updates.rfqStatus;

    const { data, error } = await this.supabase
      .from("rfqs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update RFQ: ${error.message}`);

    return this.mapRFQFromDB(data);
  }

  async assignRFQToAgent(rfqId: string, agentId: string): Promise<RFQ> {
    const { data, error } = await this.supabase
      .from("rfqs")
      .update({ created_by: agentId, status: RFQStatus.UNDER_REVIEW })
      .eq("id", rfqId)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to assign RFQ to agent: ${error.message}`);

    return this.mapRFQFromDB(data);
  }

  // RFQ Items
  async createRFQItem(rfqItem: Omit<RFQItem, "id">): Promise<RFQItem> {
    const { data, error } = await this.supabase
      .from("rfq_items")
      .insert({
        rfq_id: rfqItem.rfqId,
        category_id: rfqItem.categoryId,
        qty: rfqItem.qty,
        specs_note: rfqItem.specsNote,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create RFQ item: ${error.message}`);

    return this.mapRFQItemFromDB(data);
  }

  async getRFQItems(rfqId: string): Promise<RFQItem[]> {
    const { data, error } = await this.supabase
      .from("rfq_items")
      .select("*")
      .eq("rfq_id", rfqId);

    if (error) throw new Error(`Failed to get RFQ items: ${error.message}`);

    return data.map(this.mapRFQItemFromDB);
  }

  async updateRFQItem(id: number, updates: Partial<RFQItem>): Promise<RFQItem> {
    const updateData: any = {};

    if (updates.categoryId) updateData.category_id = updates.categoryId;
    if (updates.qty) updateData.qty = updates.qty;
    if (updates.specsNote !== undefined)
      updateData.specs_note = updates.specsNote;

    const { data, error } = await this.supabase
      .from("rfq_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update RFQ item: ${error.message}`);

    return this.mapRFQItemFromDB(data);
  }

  async deleteRFQItem(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("rfq_items")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Failed to delete RFQ item: ${error.message}`);
  }

  // Mapping functions
  private mapRFQRequestFromDB(data: any): RFQRequest {
    return {
      id: data.id,
      companyName: data.company_name,
      contactName: data.contact_name,
      contactEmail: data.contact_email,
      budgetMinXaf: data.budget_min_xaf,
      budgetMaxXaf: data.budget_max_xaf,
      isUrgent: data.is_urgent,
      comment: data.comment,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      submittedAt: new Date(data.submitted_at),
      createdBy: data.created_by,
      rfqStatus: data.rfq_status,
    };
  }

  private mapRFQFromDB(data: any): RFQ {
    return {
      id: data.id,
      companyName: data.company_name,
      contactName: data.contact_name,
      contactEmail: data.contact_email,
      budgetMinXaf: data.budget_min_xaf,
      budgetMaxXaf: data.budget_max_xaf,
      status: data.status,
      answerDocUrl: data.answer_doc_url,
      createdAt: new Date(data.created_at),
      isUrgent: data.is_urgent,
      comment: data.comment,
      deliveryDeadline: data.delivery_deadline
        ? new Date(data.delivery_deadline)
        : undefined,
      submittedAt: data.submitted_at ? new Date(data.submitted_at) : undefined,
      createdBy: data.created_by,
      rfqStatus: data.rfq_status,
    };
  }

  private mapRFQItemFromDB(data: any): RFQItem {
    return {
      id: data.id,
      rfqId: data.rfq_id,
      categoryId: data.category_id,
      qty: data.qty,
      specsNote: data.specs_note,
    };
  }
}
