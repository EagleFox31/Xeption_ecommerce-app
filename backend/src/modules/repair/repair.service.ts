import { Injectable, Inject } from "@nestjs/common";
import { CreateRepairRequestUseCase } from "../../application/repair/create-repair-request.use-case";
import { ScheduleRepairAppointmentUseCase } from "../../application/repair/schedule-repair-appointment.use-case";
import { GetRepairRequestUseCase } from "../../application/repair/get-repair-request.use-case";
import { GetUserRepairRequestsUseCase } from "../../application/repair/get-user-repair-requests.use-case";
import { GetAvailableTechniciansUseCase } from "../../application/repair/get-available-technicians.use-case";
import { GetUserAppointmentsUseCase } from "../../application/repair/get-user-appointments.use-case";
import { CancelAppointmentUseCase } from "../../application/repair/cancel-appointment.use-case";
import { REPAIR_REPOSITORY, RepairRepositoryPort } from "../../domain/repair/repair.port";
import {
  TECHNICIAN_REPOSITORY,
  TechnicianRepositoryPort,
} from "../../domain/repair/technician.repository.port";
import {
  RepairRequest,
  Technician,
  RepairAppointment,
  RepairEstimate,
  AppointmentTimeSlot,
} from "../../domain/repair/repair.entity";
import { RepairPricingService } from "../../domain/repair/repair-pricing.service";
import {
  CreateRepairRequestDto,
  ScheduleAppointmentDto,
  GetAvailableTechniciansDto,
  UpdateRepairRequestDto,
  CreateEstimateDto,
} from "./dto/repair.dto";

@Injectable()
export class RepairService {
  constructor(
    private readonly createRepairRequestUseCase: CreateRepairRequestUseCase,
    private readonly scheduleRepairAppointmentUseCase: ScheduleRepairAppointmentUseCase,
    private readonly getRepairRequestUseCase: GetRepairRequestUseCase,
    private readonly getUserRepairRequestsUseCase: GetUserRepairRequestsUseCase,
    private readonly getAvailableTechniciansUseCase: GetAvailableTechniciansUseCase,
    private readonly getUserAppointmentsUseCase: GetUserAppointmentsUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort,
    @Inject(TECHNICIAN_REPOSITORY)
    private readonly technicianRepository: TechnicianRepositoryPort,
    private readonly pricingService: RepairPricingService,
  ) {}

  // Repair Requests
  async createRepairRequest(
    data: CreateRepairRequestDto & { userId: string },
  ): Promise<RepairRequest> {
    return await this.createRepairRequestUseCase.execute({
      userId: data.userId,
      deviceType: data.deviceType,
      deviceBrand: data.deviceBrand,
      deviceModel: data.deviceModel,
      issueDescription: data.issueDescription,
      urgencyLevel: data.urgencyLevel,
    });
  }

  async getRepairRequest(id: string, userId: string): Promise<RepairRequest> {
    return await this.getRepairRequestUseCase.execute({
      repairRequestId: id,
      userId,
    });
  }

  async getUserRepairRequests(userId: string): Promise<RepairRequest[]> {
    return await this.getUserRepairRequestsUseCase.execute({ userId });
  }

  async updateRepairRequest(
    id: string,
    updates: UpdateRepairRequestDto,
    userId: string,
  ): Promise<RepairRequest> {
    // Vérifier que la demande appartient à l'utilisateur
    const repairRequest = await this.getRepairRequest(id, userId);

    return await this.repairRepository.updateRepairRequest(id, updates);
  }

  async deleteRepairRequest(id: string, userId: string): Promise<void> {
    // Vérifier que la demande appartient à l'utilisateur
    await this.getRepairRequest(id, userId);

    return await this.repairRepository.deleteRepairRequest(id);
  }

  // Technicians
  async getAvailableTechnicians(
    query: GetAvailableTechniciansDto,
  ): Promise<Technician[]> {
    return await this.getAvailableTechniciansUseCase.execute({
      specialty: query.specialty,
      region: query.region,
      city: query.city,
    });
  }

  async getTechnician(id: string): Promise<Technician> {
    const technician = await this.technicianRepository.getById(id);
    if (!technician) {
      throw new Error("Technician not found");
    }
    return technician;
  }

  // Appointments
  async scheduleAppointment(
    data: ScheduleAppointmentDto & { userId: string },
  ): Promise<RepairAppointment> {
    return await this.scheduleRepairAppointmentUseCase.execute({
      repairRequestId: data.repairRequestId,
      userId: data.userId,
      technicianId: data.technicianId,
      scheduledDate: new Date(data.scheduledDate),
      timeSlot: data.timeSlot,
      address: data.address,
      notes: data.notes,
    });
  }

  async getUserAppointments(userId: string): Promise<RepairAppointment[]> {
    return await this.getUserAppointmentsUseCase.execute({ userId });
  }

  async getAppointment(id: string, userId: string): Promise<RepairAppointment> {
    const appointment = await this.repairRepository.getAppointmentById(id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.userId !== userId) {
      throw new Error("Unauthorized: Appointment does not belong to user");
    }

    return appointment;
  }

  async cancelAppointment(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<void> {
    return await this.cancelAppointmentUseCase.execute({
      appointmentId: id,
      userId,
      reason,
    });
  }

  // Estimates
  async createEstimate(
    data: CreateEstimateDto & { technicianId: string },
  ): Promise<RepairEstimate> {
    return await this.repairRepository.createEstimate({
      repairRequestId: data.repairRequestId,
      technicianId: data.technicianId,
      estimatedCost: data.estimatedCost,
      estimatedDuration: data.estimatedDuration,
      partsNeeded: data.partsNeeded,
      laborCost: data.laborCost,
      notes: data.notes,
      validUntil: new Date(data.validUntil),
    });
  }

  async getEstimatesByRepairRequest(
    repairRequestId: string,
    userId: string,
  ): Promise<RepairEstimate[]> {
    // Vérifier que la demande de réparation appartient à l'utilisateur
    await this.getRepairRequest(repairRequestId, userId);

    return await this.repairRepository.getEstimatesByRepairRequest(
      repairRequestId,
    );
  }

  async getEstimate(id: string, userId: string): Promise<RepairEstimate> {
    const estimate = await this.repairRepository.getEstimateById(id);
    if (!estimate) {
      throw new Error("Estimate not found");
    }

    // Vérifier que la demande de réparation appartient à l'utilisateur
    await this.getRepairRequest(estimate.repairRequestId, userId);

    return estimate;
  }

  // Utility methods
  async getAvailableTimeSlots(
    technicianId: string,
    date: Date,
  ): Promise<AppointmentTimeSlot[]> {
    return await this.technicianRepository.getAvailableTimeSlots(
      technicianId,
      date,
    );
  }

  async getRepairCostEstimate(
    deviceType: string,
    issueType: string,
  ): Promise<{ min: number; max: number }> {
    return await this.pricingService.calculateRepairCost(deviceType, issueType);
  }
}
