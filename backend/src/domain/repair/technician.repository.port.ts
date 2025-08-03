import { Technician, TechnicianSpecialty, AppointmentTimeSlot } from "./repair.entity";

export const TECHNICIAN_REPOSITORY = Symbol("TechnicianRepositoryPort");

export interface TechnicianRepositoryPort {
  findAvailable(criteria: {
    specialty: TechnicianSpecialty;
    location: { region: string; city?: string };
  }): Promise<Technician[]>;
  getById(id: string): Promise<Technician | null>;
  updateAvailability(id: string, isAvailable: boolean): Promise<void>;
  checkTimeSlotAvailability(
    technicianId: string,
    date: Date,
    timeSlot: AppointmentTimeSlot,
  ): Promise<boolean>;
  getAvailableTimeSlots(
    technicianId: string,
    date: Date,
  ): Promise<AppointmentTimeSlot[]>;
}
