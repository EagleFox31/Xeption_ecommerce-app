import { Injectable, Inject } from "@nestjs/common";
import {
  REPAIR_REPOSITORY,
  REPAIR_DOMAIN_SERVICE,
  RepairRepositoryPort,
  RepairDomainServicePort,
} from "../../domain/repair/repair.port";
import { RepairStatus } from "../../domain/repair/repair.entity";

export interface CancelAppointmentCommand {
  appointmentId: string;
  userId: string;
  reason?: string;
}

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort,
    @Inject(REPAIR_DOMAIN_SERVICE)
    private readonly repairService: RepairDomainServicePort,
  ) {}

  async execute(command: CancelAppointmentCommand): Promise<void> {
    // Vérification que le rendez-vous existe
    const appointment = await this.repairRepository.getAppointmentById(
      command.appointmentId,
    );
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Vérification que le rendez-vous appartient à l'utilisateur
    if (appointment.userId !== command.userId) {
      throw new Error("Unauthorized: Appointment does not belong to user");
    }

    // Vérification que le rendez-vous peut être annulé
    if (
      appointment.status === "cancelled" ||
      appointment.status === "completed"
    ) {
      throw new Error("Cannot cancel appointment with current status");
    }

    // Vérification du délai d'annulation (au moins 2 heures avant)
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledDate);
    const timeDifference = appointmentTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      throw new Error(
        "Cannot cancel appointment less than 2 hours before scheduled time",
      );
    }

    // Annulation du rendez-vous
    await this.repairRepository.cancelAppointment(command.appointmentId);

    // Mise à jour du statut de la demande de réparation
    await this.repairRepository.updateRepairRequest(
      appointment.repairRequestId,
      {
        status: RepairStatus.PENDING,
        technicianId: null,
        appointmentId: null,
      },
    );

    // Libération du créneau du technicien
    await this.repairRepository.updateTechnicianAvailability(
      appointment.technicianId,
      true,
    );

    // Envoi de la notification d'annulation
    await this.repairService.sendAppointmentNotification(
      command.appointmentId,
      "cancellation",
    );
  }
}
