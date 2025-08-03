import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { RepairStatusEnum } from "@prisma/client";
import {
  RepairRequest,
  Technician,
  RepairAppointment,
  RepairEstimate,
  RepairStatus,
  TechnicianSpecialty,
  AppointmentTimeSlot,
} from "../../../domain/repair/repair.entity";
import { RepairRepositoryPort } from "../../../domain/repair/repair.port";

@Injectable()
export class PrismaRepairRepository implements RepairRepositoryPort {
  constructor(private prisma: PrismaService) {}

  // Repair Requests
  async createRepairRequest(
    request: Omit<RepairRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<RepairRequest> {
    const repairJob = await this.prisma.repairJob.create({
      data: {
        userId: request.userId,
        deviceInfo: {
          deviceType: request.deviceType,
          deviceBrand: request.deviceBrand,
          deviceModel: request.deviceModel,
          issueDescription: request.issueDescription,
          urgencyLevel: request.urgencyLevel,
          estimatedCost: request.estimatedCost,
          actualCost: request.actualCost,
          technicianId: request.technicianId,
          appointmentId: request.appointmentId,
        },
        problemDesc: request.issueDescription,
        status: this.mapDomainStatusToPrisma(request.status),
        technicianNotes: {},
      },
    });

    return this.mapPrismaToRepairRequest(repairJob);
  }

  async getRepairRequestById(id: string): Promise<RepairRequest | null> {
    const repairJob = await this.prisma.repairJob.findUnique({
      where: { id },
    });

    if (!repairJob) {
      return null;
    }

    return this.mapPrismaToRepairRequest(repairJob);
  }

  async getUserRepairRequests(userId: string): Promise<RepairRequest[]> {
    const repairJobs = await this.prisma.repairJob.findMany({
      where: { userId },
    });

    return repairJobs.map((job) => this.mapPrismaToRepairRequest(job));
  }

  async updateRepairRequest(
    id: string,
    updates: Partial<RepairRequest>
  ): Promise<RepairRequest> {
    // Get current repair job to merge device info
    const currentJob = await this.prisma.repairJob.findUnique({
      where: { id },
    });

    if (!currentJob) {
      throw new Error(`Repair request with id ${id} not found`);
    }

    const currentDeviceInfo = currentJob.deviceInfo as any;
    const updatedDeviceInfo = { ...currentDeviceInfo };

    // Update device info fields if present in updates
    if (updates.deviceType !== undefined) {
      updatedDeviceInfo.deviceType = updates.deviceType;
    }
    if (updates.deviceBrand !== undefined) {
      updatedDeviceInfo.deviceBrand = updates.deviceBrand;
    }
    if (updates.deviceModel !== undefined) {
      updatedDeviceInfo.deviceModel = updates.deviceModel;
    }
    if (updates.issueDescription !== undefined) {
      updatedDeviceInfo.issueDescription = updates.issueDescription;
    }
    if (updates.urgencyLevel !== undefined) {
      updatedDeviceInfo.urgencyLevel = updates.urgencyLevel;
    }
    if (updates.estimatedCost !== undefined) {
      updatedDeviceInfo.estimatedCost = updates.estimatedCost;
    }
    if (updates.actualCost !== undefined) {
      updatedDeviceInfo.actualCost = updates.actualCost;
    }
    if (updates.technicianId !== undefined) {
      updatedDeviceInfo.technicianId = updates.technicianId;
    }
    if (updates.appointmentId !== undefined) {
      updatedDeviceInfo.appointmentId = updates.appointmentId;
    }

    const data: any = {
      deviceInfo: updatedDeviceInfo,
    };

    // Update problem description if present
    if (updates.issueDescription !== undefined) {
      data.problemDesc = updates.issueDescription;
    }

    // Update status if present
    if (updates.status !== undefined) {
      data.status = this.mapDomainStatusToPrisma(updates.status);
    }

    const updatedRepairJob = await this.prisma.repairJob.update({
      where: { id },
      data,
    });

    return this.mapPrismaToRepairRequest(updatedRepairJob);
  }

  async deleteRepairRequest(id: string): Promise<void> {
    await this.prisma.repairJob.delete({
      where: { id },
    });
  }

  // Technicians
  async getTechnicianById(id: string): Promise<Technician | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        technicianAvailability: true,
      },
    });

    if (!user || user.role !== "agent") {
      return null;
    }

    return this.mapUserToTechnician(user);
  }

  async getAvailableTechnicians(
    specialty: TechnicianSpecialty,
    location: { region: string; city: string }
  ): Promise<Technician[]> {
    // Récupérer tous les techniciens (utilisateurs avec le rôle 'agent')
    const users = await this.prisma.user.findMany({
      where: {
        role: "agent",
      },
      include: {
        technicianAvailability: true,
        // Ici on pourrait inclure d'autres relations si nécessaire
      },
    });

    // Transformer les utilisateurs en techniciens et filtrer selon les critères
    return users
      .map((user) => this.mapUserToTechnician(user))
      .filter((technician) => {
        // Filtrer par disponibilité
        if (!technician.isAvailable) return false;
        
        // Filtrer par spécialité
        if (!technician.specialties.includes(specialty)) return false;
        
        // Filtrer par localisation (région et ville)
        if (technician.location.region !== location.region) return false;
        if (location.city && technician.location.city !== location.city) return false;
        
        return true;
      });
  }

  async updateTechnicianAvailability(
    id: string,
    isAvailable: boolean
  ): Promise<void> {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const formattedDate = new Date(dateString);

    if (isAvailable) {
      // Si le technicien est disponible, nous créons ou mettons à jour son entrée dans la table TechnicianAvailability
      await this.prisma.technicianAvailability.upsert({
        where: {
          technicianId_availableDate: {
            technicianId: id,
            availableDate: formattedDate,
          },
        },
        update: {
          // Conserver les heures existantes si présentes
          // Aucune modification n'est nécessaire car l'entrée existe déjà
        },
        create: {
          technicianId: id,
          availableDate: formattedDate,
          availableHours: [
            AppointmentTimeSlot.MORNING_8_10,
            AppointmentTimeSlot.MORNING_10_12,
            AppointmentTimeSlot.AFTERNOON_14_16,
            AppointmentTimeSlot.AFTERNOON_16_18,
          ],
        },
      });
    } else {
      // Si le technicien n'est pas disponible, nous supprimons son entrée dans la table TechnicianAvailability
      await this.prisma.technicianAvailability.deleteMany({
        where: {
          technicianId: id,
          availableDate: formattedDate,
        },
      });
    }
  }

  // Appointments
  async createAppointment(
    appointment: Omit<RepairAppointment, "id" | "createdAt" | "updatedAt">
  ): Promise<RepairAppointment> {
    // Since there's no specific appointment table, we'll store this information
    // in the repairJob and generate a unique ID for the appointment
    // Génération d'un UUID pour l'appointmentId en utilisant la fonction gen_random_uuid() de PostgreSQL
    const result = await this.prisma.$queryRaw`SELECT gen_random_uuid() as uuid`;
    const appointmentId = (result as any)[0].uuid;

    // First, find the repair job to update
    const repairJob = await this.prisma.repairJob.findUnique({
      where: { id: appointment.repairRequestId },
    });

    if (!repairJob) {
      throw new Error(`Repair request ${appointment.repairRequestId} not found`);
    }

    // Update the device info to include appointment details
    const deviceInfo = repairJob.deviceInfo as any;
    deviceInfo.appointmentId = appointmentId;
    
    // Store appointment info in technician notes for now
    const technicianNotes = repairJob.technicianNotes as any || {};
    technicianNotes.appointment = {
      id: appointmentId,
      repairRequestId: appointment.repairRequestId,
      technicianId: appointment.technicianId,
      userId: appointment.userId,
      scheduledDate: appointment.scheduledDate,
      timeSlot: appointment.timeSlot,
      address: appointment.address,
      notes: appointment.notes,
      status: appointment.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update the repair job with appointment info
    await this.prisma.repairJob.update({
      where: { id: appointment.repairRequestId },
      data: {
        deviceInfo,
        technicianNotes,
        preferredDate: appointment.scheduledDate,
        status: RepairStatusEnum.scheduled,
      },
    });

    // Create availability record for the technician
    await this.prisma.technicianAvailability.upsert({
      where: {
        technicianId_availableDate: {
          technicianId: appointment.technicianId,
          availableDate: new Date(
            appointment.scheduledDate.toISOString().split("T")[0]
          ),
        },
      },
      update: {
        availableHours: {
          push: appointment.timeSlot,
        },
      },
      create: {
        technicianId: appointment.technicianId,
        availableDate: new Date(
          appointment.scheduledDate.toISOString().split("T")[0]
        ),
        availableHours: [appointment.timeSlot],
      },
    });

    return technicianNotes.appointment;
  }

  async getAppointmentById(id: string): Promise<RepairAppointment | null> {
    // Search for repair jobs that have this appointment ID in their technician notes
    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        technicianNotes: {
          path: ["appointment", "id"],
          equals: id,
        },
      },
    });

    if (repairJobs.length === 0) {
      return null;
    }

    const repairJob = repairJobs[0];
    const technicianNotes = repairJob.technicianNotes as any;
    
    if (!technicianNotes || !technicianNotes.appointment) {
      return null;
    }

    return technicianNotes.appointment as RepairAppointment;
  }

  async getUserAppointments(userId: string): Promise<RepairAppointment[]> {
    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        userId,
        technicianNotes: {
          path: ["appointment"],
          not: undefined,
        },
      },
    });

    const appointments: RepairAppointment[] = [];
    
    for (const job of repairJobs) {
      const technicianNotes = job.technicianNotes as any;
      if (technicianNotes && technicianNotes.appointment) {
        appointments.push(technicianNotes.appointment as RepairAppointment);
      }
    }

    return appointments;
  }

  async getTechnicianAppointments(
    technicianId: string,
    date?: Date
  ): Promise<RepairAppointment[]> {
    // Build the query based on whether a date is provided
    const query: any = {
      technicianNotes: {
        path: ["appointment", "technicianId"],
        equals: technicianId,
      },
    };

    if (date) {
      // Convert date to ISO string and match the date part
      const dateStr = date.toISOString().split("T")[0];
      query.technicianNotes = {
        path: ["appointment", "scheduledDate"],
        startsWith: dateStr,
      };
    }

    const repairJobs = await this.prisma.repairJob.findMany({
      where: query,
    });

    const appointments: RepairAppointment[] = [];
    
    for (const job of repairJobs) {
      const technicianNotes = job.technicianNotes as any;
      if (technicianNotes && technicianNotes.appointment) {
        appointments.push(technicianNotes.appointment as RepairAppointment);
      }
    }

    return appointments;
  }

  async updateAppointment(
    id: string,
    updates: Partial<RepairAppointment>
  ): Promise<RepairAppointment> {
    // Find the repair job with this appointment ID
    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        technicianNotes: {
          path: ["appointment", "id"],
          equals: id,
        },
      },
    });

    if (repairJobs.length === 0) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    const repairJob = repairJobs[0];
    const technicianNotes = repairJob.technicianNotes as any;
    
    if (!technicianNotes || !technicianNotes.appointment) {
      throw new Error(`Appointment data not found for id ${id}`);
    }

    // Update the appointment data
    const appointment = technicianNotes.appointment as RepairAppointment;
    const updatedAppointment = { ...appointment };

    if (updates.scheduledDate !== undefined) {
      updatedAppointment.scheduledDate = updates.scheduledDate;
    }
    if (updates.timeSlot !== undefined) {
      updatedAppointment.timeSlot = updates.timeSlot;
    }
    if (updates.address !== undefined) {
      updatedAppointment.address = updates.address;
    }
    if (updates.notes !== undefined) {
      updatedAppointment.notes = updates.notes;
    }
    if (updates.status !== undefined) {
      updatedAppointment.status = updates.status;
    }

    updatedAppointment.updatedAt = new Date();

    // Update the technician notes
    technicianNotes.appointment = updatedAppointment;

    // Update the repair job
    await this.prisma.repairJob.update({
      where: { id: repairJob.id },
      data: {
        technicianNotes,
        preferredDate: updatedAppointment.scheduledDate,
      },
    });

    return updatedAppointment;
  }

  async cancelAppointment(id: string): Promise<void> {
    // Find the repair job with this appointment ID
    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        technicianNotes: {
          path: ["appointment", "id"],
          equals: id,
        },
      },
    });

    if (repairJobs.length === 0) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    const repairJob = repairJobs[0];
    const technicianNotes = repairJob.technicianNotes as any;
    
    if (!technicianNotes || !technicianNotes.appointment) {
      throw new Error(`Appointment data not found for id ${id}`);
    }

    // Update the appointment status to cancelled
    const appointment = technicianNotes.appointment as RepairAppointment;
    appointment.status = "cancelled";
    appointment.updatedAt = new Date();

    technicianNotes.appointment = appointment;

    // Update the repair job
    await this.prisma.repairJob.update({
      where: { id: repairJob.id },
      data: {
        technicianNotes,
        status: RepairStatusEnum.cancelled,
      },
    });
  }

  async checkTimeSlotAvailability(
    technicianId: string,
    date: Date,
    timeSlot: AppointmentTimeSlot
  ): Promise<boolean> {
    // Check if the technician is available at the given date and time slot
    const availability = await this.prisma.technicianAvailability.findUnique({
      where: {
        technicianId_availableDate: {
          technicianId,
          availableDate: new Date(date.toISOString().split("T")[0]),
        },
      },
    });

    if (!availability) {
      // If no record exists, the technician is available
      return true;
    }

    // Check if the time slot is already booked
    return !availability.availableHours.includes(timeSlot);
  }

  // Estimates
  async createEstimate(
    estimate: Omit<RepairEstimate, "id" | "createdAt">
  ): Promise<RepairEstimate> {
    // Find the repair job to update
    const repairJob = await this.prisma.repairJob.findUnique({
      where: { id: estimate.repairRequestId },
    });

    if (!repairJob) {
      throw new Error(`Repair request ${estimate.repairRequestId} not found`);
    }

    // Generate a unique ID for the estimate
    // Génération d'un UUID pour l'estimateId en utilisant la fonction gen_random_uuid() de PostgreSQL
    const result = await this.prisma.$queryRaw`SELECT gen_random_uuid() as uuid`;
    const estimateId = (result as any)[0].uuid;

    // Update the device info to include estimate details
    const deviceInfo = repairJob.deviceInfo as any;
    deviceInfo.estimatedCost = estimate.estimatedCost;
    
    // Store estimate info in technician notes
    const technicianNotes = repairJob.technicianNotes as any || {};
    
    if (!technicianNotes.estimates) {
      technicianNotes.estimates = [];
    }
    
    const newEstimate = {
      id: estimateId,
      repairRequestId: estimate.repairRequestId,
      technicianId: estimate.technicianId,
      estimatedCost: estimate.estimatedCost,
      estimatedDuration: estimate.estimatedDuration,
      partsNeeded: estimate.partsNeeded,
      laborCost: estimate.laborCost,
      notes: estimate.notes,
      validUntil: estimate.validUntil,
      createdAt: new Date(),
    };
    
    technicianNotes.estimates.push(newEstimate);

    // Update the repair job with estimate info
    await this.prisma.repairJob.update({
      where: { id: estimate.repairRequestId },
      data: {
        deviceInfo,
        technicianNotes,
      },
    });

    return newEstimate;
  }

  async getEstimatesByRepairRequest(
    repairRequestId: string
  ): Promise<RepairEstimate[]> {
    const repairJob = await this.prisma.repairJob.findUnique({
      where: { id: repairRequestId },
    });

    if (!repairJob) {
      throw new Error(`Repair request ${repairRequestId} not found`);
    }

    const technicianNotes = repairJob.technicianNotes as any;
    
    if (!technicianNotes || !technicianNotes.estimates) {
      return [];
    }

    return technicianNotes.estimates as RepairEstimate[];
  }

  async getEstimateById(id: string): Promise<RepairEstimate | null> {
    // Search for repair jobs that have this estimate ID in their technician notes
    const repairJobs = await this.prisma.repairJob.findMany();
    
    for (const job of repairJobs) {
      const technicianNotes = job.technicianNotes as any;
      
      if (technicianNotes && technicianNotes.estimates) {
        const estimate = technicianNotes.estimates.find(
          (est: any) => est.id === id
        );
        
        if (estimate) {
          return estimate as RepairEstimate;
        }
      }
    }

    return null;
  }

  // Helper methods for mapping between domain and Prisma models
  private mapPrismaToRepairRequest(repairJob: any): RepairRequest {
    const deviceInfo = repairJob.deviceInfo as any;
    
    return {
      id: repairJob.id,
      userId: repairJob.userId,
      deviceType: deviceInfo.deviceType || "",
      deviceBrand: deviceInfo.deviceBrand || "",
      deviceModel: deviceInfo.deviceModel || "",
      issueDescription: repairJob.problemDesc || "",
      urgencyLevel: deviceInfo.urgencyLevel || "medium",
      estimatedCost: deviceInfo.estimatedCost,
      actualCost: deviceInfo.actualCost,
      status: this.mapPrismaStatusToDomain(repairJob.status),
      technicianId: deviceInfo.technicianId,
      appointmentId: deviceInfo.appointmentId,
      createdAt: repairJob.createdAt,
      updatedAt: repairJob.updatedAt,
    };
  }

  private mapUserToTechnician(user: any): Technician {
    // Extract availability information
    const isAvailable = user.technicianAvailability &&
                        user.technicianAvailability.length > 0;
    
    // Récupérer les données du technicien à partir de l'objet user
    // Dans une implémentation réelle, nous aurions des champs spécifiques pour les techniciens
    // Pour l'instant, nous allons extraire ce que nous pouvons des données utilisateur existantes
    
    // Déterminer les spécialités en fonction des données disponibles
    // Nous pouvons stocker cette information dans technicianNotes ou un autre champ
    let specialties = [] as TechnicianSpecialty[];
    
    // Si l'utilisateur a des notes techniques, essayer de les extraire
    if (user.technicianNotes) {
      const notes = user.technicianNotes as any;
      if (notes.specialties && Array.isArray(notes.specialties)) {
        specialties = notes.specialties.filter((s: string) =>
          Object.values(TechnicianSpecialty).includes(s as TechnicianSpecialty)
        );
      }
    }
    
    // Fallback: Si aucune spécialité n'est trouvée, assigner une spécialité par défaut
    // Cela devrait être remplacé par des données réelles dans le système final
    if (specialties.length === 0) {
      specialties = [TechnicianSpecialty.SMARTPHONE];
    }
    
    // Déterminer la notation (rating) à partir des données disponibles
    let rating = 0;
    if (user.technicianNotes && (user.technicianNotes as any).rating) {
      rating = (user.technicianNotes as any).rating;
    } else {
      // Fallback: notation par défaut
      rating = 5;
    }
    
    // Déterminer l'emplacement à partir des adresses de l'utilisateur
    // Dans une vraie implémentation, on récupérerait cette information des tables address, region, city, commune
    const location = {
      region: "Central",
      city: "Yaoundé",
      commune: "Nlongkak",
    };
    
    // Vérifier si l'utilisateur a des adresses associées
    if (user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find((addr: any) => addr.isDefault) || user.addresses[0];
      
      // Si l'adresse a des références aux tables region, city, commune, les utiliser
      if (defaultAddress.region) {
        location.region = defaultAddress.region.name;
      }
      
      if (defaultAddress.city) {
        location.city = defaultAddress.city.name;
      }
      
      if (defaultAddress.commune) {
        location.commune = defaultAddress.commune.name;
      }
    }
    
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone237,
      specialties,
      rating,
      isAvailable,
      location,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapDomainStatusToPrisma(status: RepairStatus): RepairStatusEnum {
    switch (status) {
      case RepairStatus.PENDING:
        return RepairStatusEnum.scheduled;
      case RepairStatus.CONFIRMED:
        return RepairStatusEnum.scheduled;
      case RepairStatus.IN_PROGRESS:
        return RepairStatusEnum.in_progress;
      case RepairStatus.COMPLETED:
        return RepairStatusEnum.completed;
      case RepairStatus.CANCELLED:
        return RepairStatusEnum.cancelled;
      default:
        return RepairStatusEnum.scheduled;
    }
  }

  private mapPrismaStatusToDomain(status: RepairStatusEnum): RepairStatus {
    switch (status) {
      case RepairStatusEnum.scheduled:
        return RepairStatus.PENDING;
      case RepairStatusEnum.in_progress:
        return RepairStatus.IN_PROGRESS;
      case RepairStatusEnum.completed:
        return RepairStatus.COMPLETED;
      case RepairStatusEnum.cancelled:
        return RepairStatus.CANCELLED;
      default:
        return RepairStatus.PENDING;
    }
  }
}