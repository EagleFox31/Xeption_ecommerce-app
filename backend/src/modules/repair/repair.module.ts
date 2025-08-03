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
import { PrismaRepairRepository } from "../../infrastructure/prisma/repositories/repair.repository";
import { PrismaTechnicianRepository } from "../../infrastructure/prisma/repositories/technician.repository";
import { REPAIR_REPOSITORY } from "../../domain/repair/repair.port";
import {
  TECHNICIAN_REPOSITORY,
} from "../../domain/repair/technician.repository.port";
import { RepairPricingService } from "../../domain/repair/repair-pricing.service";
import { TechnicianMatcherService } from "../../domain/repair/technician-matcher.service";
import { ScheduleRepairUseCase } from "../../application/repair/schedule-repair.use-case";

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
    ScheduleRepairUseCase,
    RepairPricingService,
    TechnicianMatcherService,

    // Infrastructure
    {
      provide: REPAIR_REPOSITORY,
      useClass: PrismaRepairRepository,
    },
    {
      provide: TECHNICIAN_REPOSITORY,
      useClass: PrismaTechnicianRepository,
    },
  ],
  exports: [RepairService],
})
export class RepairModule {}
