import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { RepairRepository } from "../../../domain/repair/repair.port";
import {
  RepairRequest,
  Technician,
  RepairAppointment,
  RepairEstimate,
  TechnicianSpecialty,
  AppointmentTimeSlot,
} from "../../../domain/repair/repair.entity";

@Injectable()
export class SupabaseRepairRepository implements RepairRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  // Repair Requests
  async createRepairRequest(
    request: Omit<RepairRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<RepairRequest> {
    const { data, error } = await this.supabase
      .from("repair_requests")
      .insert({
        user_id: request.userId,
        device_type: request.deviceType,
        device_brand: request.deviceBrand,
        device_model: request.deviceModel,
        issue_description: request.issueDescription,
        urgency_level: request.urgencyLevel,
        status: request.status,
        estimated_cost: request.estimatedCost,
        actual_cost: request.actualCost,
        technician_id: request.technicianId,
        appointment_id: request.appointmentId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create repair request: ${error.message}`);
    }

    return this.mapRepairRequestFromDb(data);
  }

  async getRepairRequestById(id: string): Promise<RepairRequest | null> {
    const { data, error } = await this.supabase
      .from("repair_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get repair request: ${error.message}`);
    }

    return this.mapRepairRequestFromDb(data);
  }

  async getUserRepairRequests(userId: string): Promise<RepairRequest[]> {
    const { data, error } = await this.supabase
      .from("repair_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user repair requests: ${error.message}`);
    }

    return data.map(this.mapRepairRequestFromDb);
  }

  async updateRepairRequest(
    id: string,
    updates: Partial<RepairRequest>,
  ): Promise<RepairRequest> {
    const updateData: any = {};

    if (updates.status) updateData.status = updates.status;
    if (updates.estimatedCost !== undefined)
      updateData.estimated_cost = updates.estimatedCost;
    if (updates.actualCost !== undefined)
      updateData.actual_cost = updates.actualCost;
    if (updates.technicianId !== undefined)
      updateData.technician_id = updates.technicianId;
    if (updates.appointmentId !== undefined)
      updateData.appointment_id = updates.appointmentId;

    const { data, error } = await this.supabase
      .from("repair_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update repair request: ${error.message}`);
    }

    return this.mapRepairRequestFromDb(data);
  }

  async deleteRepairRequest(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("repair_requests")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete repair request: ${error.message}`);
    }
  }

  // Technicians
  async getTechnicianById(id: string): Promise<Technician | null> {
    const { data, error } = await this.supabase
      .from("technicians")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get technician: ${error.message}`);
    }

    return this.mapTechnicianFromDb(data);
  }

  async getAvailableTechnicians(
    specialty: TechnicianSpecialty,
    location: { region: string; city: string },
  ): Promise<Technician[]> {
    const { data, error } = await this.supabase
      .from("technicians")
      .select("*")
      .eq("is_available", true)
      .contains("specialties", [specialty])
      .eq("location->>region", location.region)
      .eq("location->>city", location.city)
      .order("rating", { ascending: false });

    if (error) {
      throw new Error(`Failed to get available technicians: ${error.message}`);
    }

    return data.map(this.mapTechnicianFromDb);
  }

  async updateTechnicianAvailability(
    id: string,
    isAvailable: boolean,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("technicians")
      .update({ is_available: isAvailable })
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to update technician availability: ${error.message}`,
      );
    }
  }

  // Appointments
  async createAppointment(
    appointment: Omit<RepairAppointment, "id" | "createdAt" | "updatedAt">,
  ): Promise<RepairAppointment> {
    const { data, error } = await this.supabase
      .from("repair_appointments")
      .insert({
        repair_request_id: appointment.repairRequestId,
        technician_id: appointment.technicianId,
        user_id: appointment.userId,
        scheduled_date: appointment.scheduledDate.toISOString(),
        time_slot: appointment.timeSlot,
        address: appointment.address,
        notes: appointment.notes,
        status: appointment.status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }

    return this.mapAppointmentFromDb(data);
  }

  async getAppointmentById(id: string): Promise<RepairAppointment | null> {
    const { data, error } = await this.supabase
      .from("repair_appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get appointment: ${error.message}`);
    }

    return this.mapAppointmentFromDb(data);
  }

  async getUserAppointments(userId: string): Promise<RepairAppointment[]> {
    const { data, error } = await this.supabase
      .from("repair_appointments")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_date", { ascending: true });

    if (error) {
      throw new Error(`Failed to get user appointments: ${error.message}`);
    }

    return data.map(this.mapAppointmentFromDb);
  }

  async getTechnicianAppointments(
    technicianId: string,
    date?: Date,
  ): Promise<RepairAppointment[]> {
    let query = this.supabase
      .from("repair_appointments")
      .select("*")
      .eq("technician_id", technicianId);

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte("scheduled_date", startOfDay.toISOString())
        .lte("scheduled_date", endOfDay.toISOString());
    }

    const { data, error } = await query.order("scheduled_date", {
      ascending: true,
    });

    if (error) {
      throw new Error(
        `Failed to get technician appointments: ${error.message}`,
      );
    }

    return data.map(this.mapAppointmentFromDb);
  }

  async updateAppointment(
    id: string,
    updates: Partial<RepairAppointment>,
  ): Promise<RepairAppointment> {
    const updateData: any = {};

    if (updates.scheduledDate)
      updateData.scheduled_date = updates.scheduledDate.toISOString();
    if (updates.timeSlot) updateData.time_slot = updates.timeSlot;
    if (updates.address) updateData.address = updates.address;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status) updateData.status = updates.status;

    const { data, error } = await this.supabase
      .from("repair_appointments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }

    return this.mapAppointmentFromDb(data);
  }

  async cancelAppointment(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("repair_appointments")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to cancel appointment: ${error.message}`);
    }
  }

  async checkTimeSlotAvailability(
    technicianId: string,
    date: Date,
    timeSlot: AppointmentTimeSlot,
  ): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await this.supabase
      .from("repair_appointments")
      .select("id")
      .eq("technician_id", technicianId)
      .eq("time_slot", timeSlot)
      .gte("scheduled_date", startOfDay.toISOString())
      .lte("scheduled_date", endOfDay.toISOString())
      .neq("status", "cancelled");

    if (error) {
      throw new Error(
        `Failed to check time slot availability: ${error.message}`,
      );
    }

    return data.length === 0;
  }

  // Estimates
  async createEstimate(
    estimate: Omit<RepairEstimate, "id" | "createdAt">,
  ): Promise<RepairEstimate> {
    const { data, error } = await this.supabase
      .from("repair_estimates")
      .insert({
        repair_request_id: estimate.repairRequestId,
        technician_id: estimate.technicianId,
        estimated_cost: estimate.estimatedCost,
        estimated_duration: estimate.estimatedDuration,
        parts_needed: estimate.partsNeeded,
        labor_cost: estimate.laborCost,
        notes: estimate.notes,
        valid_until: estimate.validUntil.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create estimate: ${error.message}`);
    }

    return this.mapEstimateFromDb(data);
  }

  async getEstimatesByRepairRequest(
    repairRequestId: string,
  ): Promise<RepairEstimate[]> {
    const { data, error } = await this.supabase
      .from("repair_estimates")
      .select("*")
      .eq("repair_request_id", repairRequestId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get estimates: ${error.message}`);
    }

    return data.map(this.mapEstimateFromDb);
  }

  async getEstimateById(id: string): Promise<RepairEstimate | null> {
    const { data, error } = await this.supabase
      .from("repair_estimates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get estimate: ${error.message}`);
    }

    return this.mapEstimateFromDb(data);
  }

  // Mapping methods
  private mapRepairRequestFromDb(data: any): RepairRequest {
    return {
      id: data.id,
      userId: data.user_id,
      deviceType: data.device_type,
      deviceBrand: data.device_brand,
      deviceModel: data.device_model,
      issueDescription: data.issue_description,
      urgencyLevel: data.urgency_level,
      estimatedCost: data.estimated_cost,
      actualCost: data.actual_cost,
      status: data.status,
      technicianId: data.technician_id,
      appointmentId: data.appointment_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapTechnicianFromDb(data: any): Technician {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialties: data.specialties,
      rating: data.rating,
      isAvailable: data.is_available,
      location: data.location,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapAppointmentFromDb(data: any): RepairAppointment {
    return {
      id: data.id,
      repairRequestId: data.repair_request_id,
      technicianId: data.technician_id,
      userId: data.user_id,
      scheduledDate: new Date(data.scheduled_date),
      timeSlot: data.time_slot,
      address: data.address,
      notes: data.notes,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapEstimateFromDb(data: any): RepairEstimate {
    return {
      id: data.id,
      repairRequestId: data.repair_request_id,
      technicianId: data.technician_id,
      estimatedCost: data.estimated_cost,
      estimatedDuration: data.estimated_duration,
      partsNeeded: data.parts_needed,
      laborCost: data.labor_cost,
      notes: data.notes,
      validUntil: new Date(data.valid_until),
      createdAt: new Date(data.created_at),
    };
  }
}
