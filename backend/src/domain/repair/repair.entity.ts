export enum RepairStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TechnicianSpecialty {
  SMARTPHONE = "smartphone",
  LAPTOP = "laptop",
  TABLET = "tablet",
  DESKTOP = "desktop",
  GAMING = "gaming",
  AUDIO = "audio",
  TV = "tv",
  APPLIANCE = "appliance",
}

export enum AppointmentTimeSlot {
  MORNING_8_10 = "08:00-10:00",
  MORNING_10_12 = "10:00-12:00",
  AFTERNOON_14_16 = "14:00-16:00",
  AFTERNOON_16_18 = "16:00-18:00",
}

export interface RepairRequest {
  id: string;
  userId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  urgencyLevel: "low" | "medium" | "high";
  estimatedCost?: number;
  actualCost?: number;
  status: RepairStatus;
  technicianId?: string;
  appointmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: TechnicianSpecialty[];
  rating: number;
  isAvailable: boolean;
  location: {
    region: string;
    city: string;
    commune: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairAppointment {
  id: string;
  repairRequestId: string;
  technicianId: string;
  userId: string;
  scheduledDate: Date;
  timeSlot: AppointmentTimeSlot;
  address: {
    street: string;
    city: string;
    commune: string;
    region: string;
    postalCode?: string;
  };
  notes?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairEstimate {
  id: string;
  repairRequestId: string;
  technicianId: string;
  estimatedCost: number;
  estimatedDuration: number; // en heures
  partsNeeded: {
    name: string;
    cost: number;
    availability: "in_stock" | "order_required";
  }[];
  laborCost: number;
  notes?: string;
  validUntil: Date;
  createdAt: Date;
}
