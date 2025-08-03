import {
  RepairRequest,
  RepairAppointment,
  RepairEstimate,
  AppointmentTimeSlot,
} from "./repair.entity";

/**
 * Injection tokens — uniques et accessibles à l’exécution.
 * Utilisez‑les dans vos modules NestJS pour lier les adapters
 * (Prisma, Supabase, InMemory, etc.) à leurs ports de domaine.
 */
export const REPAIR_REPOSITORY = Symbol("RepairRepositoryPort");

/* ------------------------------------------------------------------
 * Repository Port
 * ------------------------------------------------------------------ */
export interface RepairRepositoryPort {
  // Repair Requests
  createRepairRequest(
    request: Omit<RepairRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<RepairRequest>;
  getRepairRequestById(id: string): Promise<RepairRequest | null>;
  getUserRepairRequests(userId: string): Promise<RepairRequest[]>;
  updateRepairRequest(
    id: string,
    updates: Partial<RepairRequest>,
  ): Promise<RepairRequest>;
  deleteRepairRequest(id: string): Promise<void>;

  // Appointments
  createAppointment(
    appointment: Omit<RepairAppointment, "id" | "createdAt" | "updatedAt">,
  ): Promise<RepairAppointment>;
  getAppointmentById(id: string): Promise<RepairAppointment | null>;
  getUserAppointments(userId: string): Promise<RepairAppointment[]>;
  getTechnicianAppointments(
    technicianId: string,
    date?: Date,
  ): Promise<RepairAppointment[]>;
  updateAppointment(
    id: string,
    updates: Partial<RepairAppointment>,
  ): Promise<RepairAppointment>;
  cancelAppointment(id: string): Promise<void>;

  // Estimates
  createEstimate(
    estimate: Omit<RepairEstimate, "id" | "createdAt">,
  ): Promise<RepairEstimate>;
  getEstimatesByRepairRequest(
    repairRequestId: string,
  ): Promise<RepairEstimate[]>;
  getEstimateById(id: string): Promise<RepairEstimate | null>;
}
