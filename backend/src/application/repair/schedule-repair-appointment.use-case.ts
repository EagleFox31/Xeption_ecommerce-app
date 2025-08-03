import { Injectable, Inject } from "@nestjs/common";
import {
  REPAIR_REPOSITORY,
  REPAIR_DOMAIN_SERVICE,
  RepairRepositoryPort,
  RepairDomainServicePort,
} from "../../domain/repair/repair.port";
import {
  RepairAppointment,
  AppointmentTimeSlot,
  RepairStatus,
} from "../../domain/repair/repair.entity";

export interface ScheduleRepairAppointmentCommand {
  repairRequestId: string;
  userId: string;
  technicianId: string;
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
}

@Injectable()
export class ScheduleRepairAppointmentUseCase {
  constructor(
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort,
    @Inject(REPAIR_DOMAIN_SERVICE)
    private readonly repairService: RepairDomainServicePort,
  ) {}

  async execute(
    command: ScheduleRepairAppointmentCommand,
  ): Promise<RepairAppointment> {
    // Vérification que la demande de réparation existe et appartient à l'utilisateur
    const repairRequest = await this.repairRepository.getRepairRequestById(
      command.repairRequestId,
    );
    if (!repairRequest) {
      throw new Error("Repair request not found");
    }

    if (repairRequest.userId !== command.userId) {
      throw new Error("Unauthorized: Repair request does not belong to user");
    }

    // Vérification que le technicien existe et est disponible
    const technician = await this.repairRepository.getTechnicianById(
      command.technicianId,
    );
    if (!technician) {
      throw new Error("Technician not found");
    }

    if (!technician.isAvailable) {
      throw new Error("Technician is not available");
    }

    // Vérification de la disponibilité du créneau
    const isTimeSlotAvailable =
      await this.repairRepository.checkTimeSlotAvailability(
        command.technicianId,
        command.scheduledDate,
        command.timeSlot,
      );

    if (!isTimeSlotAvailable) {
      throw new Error("Time slot is not available");
    }

    // Validation de la date (ne peut pas être dans le passé)
    if (command.scheduledDate < new Date()) {
      throw new Error("Cannot schedule appointment in the past");
    }

    // Création du rendez-vous
    const appointmentData = {
      repairRequestId: command.repairRequestId,
      technicianId: command.technicianId,
      userId: command.userId,
      scheduledDate: command.scheduledDate,
      timeSlot: command.timeSlot,
      address: command.address,
      notes: command.notes,
      status: "scheduled" as const,
    };

    const appointment =
      await this.repairRepository.createAppointment(appointmentData);

    // Mise à jour du statut de la demande de réparation
    await this.repairRepository.updateRepairRequest(command.repairRequestId, {
      status: RepairStatus.CONFIRMED,
      technicianId: command.technicianId,
      appointmentId: appointment.id,
    });

    // Envoi de la notification de confirmation
    await this.repairService.sendAppointmentNotification(
      appointment.id,
      "confirmation",
    );

    return appointment;
  }
}
