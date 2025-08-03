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
import { PrismaRepairDomainService } from "../../infrastructure/prisma/services/repair-domain.service";
import {
  REPAIR_REPOSITORY,
  REPAIR_DOMAIN_SERVICE,
} from "../../domain/repair/repair.port";

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
      provide: REPAIR_REPOSITORY,
      useClass: PrismaRepairRepository, // Using Prisma implementation
    },
    {
      provide: REPAIR_DOMAIN_SERVICE,
      useClass: PrismaRepairDomainService,
    },
  ],
  exports: [RepairService],
})
export class RepairModule {}
