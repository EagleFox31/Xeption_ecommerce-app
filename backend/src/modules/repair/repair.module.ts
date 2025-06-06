import { Module } from "@nestjs/common";
import { RepairController } from "./repair.controller";
import { RepairService } from "./repair.service";

// Use Cases
import { CreateRepairRequestUseCase } from "../../application/repair/create-repair-request.use-case";
import { ScheduleRepairAppointmentUseCase } from "../../application/repair/schedule-repair-appointment.use-case";
import { GetRepairRequestUseCase } from "../../application/repair/get-repair-request.use-case";
import { GetUserRepairRequestsUseCase } from "../../application/repair/get-user-repair-requests.use-case";
import { GetAvailableTechniciansUseCase } from "../../application/repair/get-available-technicians.use-case";
import { GetUserAppointmentsUseCase } from "../../application/repair/get-user-appointments.use-case";
import { CancelAppointmentUseCase } from "../../application/repair/cancel-appointment.use-case";

// Infrastructure
import { SupabaseRepairRepository } from "../../infrastructure/supabase/repositories/repair.repository";
import {
  RepairRepository,
  RepairService as RepairDomainService,
} from "../../domain/repair/repair.port";

// Mock implementation of RepairDomainService for now
import { Injectable } from "@nestjs/common";
import {
  AppointmentTimeSlot,
  TechnicianSpecialty,
} from "../../domain/repair/repair.entity";

@Injectable()
class MockRepairDomainService implements RepairDomainService {
  async calculateRepairCost(
    deviceType: string,
    issueType: string,
  ): Promise<{ min: number; max: number }> {
    // Mock implementation - in real app, this would use business logic
    const baseCosts = {
      smartphone: { min: 15000, max: 50000 },
      laptop: { min: 25000, max: 100000 },
      tablet: { min: 20000, max: 75000 },
      desktop: { min: 30000, max: 120000 },
      gaming: { min: 40000, max: 150000 },
      audio: { min: 10000, max: 40000 },
      tv: { min: 35000, max: 200000 },
      appliance: { min: 20000, max: 80000 },
    };

    return baseCosts[deviceType.toLowerCase()] || { min: 15000, max: 50000 };
  }

  async findBestTechnician(
    specialty: TechnicianSpecialty,
    location: { region: string; city: string },
  ) {
    // Mock implementation - would use complex matching algorithm
    return null;
  }

  async getAvailableTimeSlots(
    technicianId: string,
    date: Date,
  ): Promise<AppointmentTimeSlot[]> {
    // Mock implementation - would check technician's schedule
    const allSlots = [
      AppointmentTimeSlot.MORNING_8_10,
      AppointmentTimeSlot.MORNING_10_12,
      AppointmentTimeSlot.AFTERNOON_14_16,
      AppointmentTimeSlot.AFTERNOON_16_18,
    ];

    // Return all slots for now - in real app, would filter based on existing appointments
    return allSlots;
  }

  async sendAppointmentNotification(
    appointmentId: string,
    type: "confirmation" | "reminder" | "cancellation",
  ): Promise<void> {
    // Mock implementation - would send email/SMS notifications
    console.log(
      `Sending ${type} notification for appointment ${appointmentId}`,
    );
  }
}

@Module({
  controllers: [RepairController],
  providers: [
    RepairService,

    // Use Cases
    CreateRepairRequestUseCase,
    ScheduleRepairAppointmentUseCase,
    GetRepairRequestUseCase,
    GetUserRepairRequestsUseCase,
    GetAvailableTechniciansUseCase,
    GetUserAppointmentsUseCase,
    CancelAppointmentUseCase,

    // Infrastructure
    {
      provide: RepairRepository,
      useClass: SupabaseRepairRepository,
    },
    {
      provide: RepairDomainService,
      useClass: MockRepairDomainService,
    },
  ],
  exports: [RepairService],
})
export class RepairModule {}
