import {
  RepairRequest,
  Technician,
  RepairAppointment,
  RepairEstimate,
  TechnicianSpecialty,
  AppointmentTimeSlot,
} from "./repair.entity";

/**
 * Injection tokens — uniques et accessibles à l’exécution.
 * Utilisez‑les dans vos modules NestJS pour lier les adapters
 * (Prisma, Supabase, InMemory, etc.) à leurs ports de domaine.
 */
export const REPAIR_REPOSITORY = Symbol("RepairRepositoryPort");
export const REPAIR_DOMAIN_SERVICE = Symbol("RepairDomainServicePort");

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

  // Technicians
  getTechnicianById(id: string): Promise<Technician | null>;
  getAvailableTechnicians(
    specialty: TechnicianSpecialty,
    location: { region: string; city: string },
  ): Promise<Technician[]>;
  updateTechnicianAvailability(id: string, isAvailable: boolean): Promise<void>;

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
  checkTimeSlotAvailability(
    technicianId: string,
    date: Date,
    timeSlot: AppointmentTimeSlot,
  ): Promise<boolean>;

  // Estimates
  createEstimate(
    estimate: Omit<RepairEstimate, "id" | "createdAt">,
  ): Promise<RepairEstimate>;
  getEstimatesByRepairRequest(
    repairRequestId: string,
  ): Promise<RepairEstimate[]>;
  getEstimateById(id: string): Promise<RepairEstimate | null>;
}

/* ------------------------------------------------------------------
 * Domain Service Port
 * ------------------------------------------------------------------ */
export interface RepairDomainServicePort {
  calculateRepairCost(
    deviceType: string,
    issueType: string,
  ): Promise<{ min: number; max: number }>;
  findBestTechnician(
    specialty: TechnicianSpecialty,
    location: { region: string; city: string },
  ): Promise<Technician | null>;
  getAvailableTimeSlots(
    technicianId: string,
    date: Date,
  ): Promise<AppointmentTimeSlot[]>;
  sendAppointmentNotification(
    appointmentId: string,
    type: "confirmation" | "reminder" | "cancellation",
  ): Promise<void>;
}
