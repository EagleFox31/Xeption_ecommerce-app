import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { RepairService } from "./repair.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtPayload } from "../../common/auth/jwt.types";
import {
  CreateRepairRequestDto,
  ScheduleAppointmentDto,
  GetAvailableTechniciansDto,
  CancelAppointmentDto,
  UpdateRepairRequestDto,
  CreateEstimateDto,
  RepairRequestResponseDto,
  TechnicianResponseDto,
  AppointmentResponseDto,
  EstimateResponseDto,
} from "./dto/repair.dto";

@Controller("repair")
@UseGuards(AuthGuard)
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  // Repair Requests
  @Post("requests")
  @HttpCode(HttpStatus.CREATED)
  async createRepairRequest(
    @Body() createRepairRequestDto: CreateRepairRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<RepairRequestResponseDto> {
    return await this.repairService.createRepairRequest({
      ...createRepairRequestDto,
      userId: user.sub,
    });
  }

  @Get("requests")
  async getUserRepairRequests(
    @CurrentUser() user: JwtPayload,
  ): Promise<RepairRequestResponseDto[]> {
    return await this.repairService.getUserRepairRequests(user.sub);
  }

  @Get("requests/:id")
  async getRepairRequest(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<RepairRequestResponseDto> {
    return await this.repairService.getRepairRequest(id, user.sub);
  }

  @Put("requests/:id")
  async updateRepairRequest(
    @Param("id") id: string,
    @Body() updateRepairRequestDto: UpdateRepairRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<RepairRequestResponseDto> {
    return await this.repairService.updateRepairRequest(
      id,
      updateRepairRequestDto,
      user.sub,
    );
  }

  @Delete("requests/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRepairRequest(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return await this.repairService.deleteRepairRequest(id, user.sub);
  }

  // Technicians
  @Get("technicians")
  async getAvailableTechnicians(
    @Query() query: GetAvailableTechniciansDto,
  ): Promise<TechnicianResponseDto[]> {
    return await this.repairService.getAvailableTechnicians(query);
  }

  @Get("technicians/:id")
  async getTechnician(@Param("id") id: string): Promise<TechnicianResponseDto> {
    return await this.repairService.getTechnician(id);
  }

  // Appointments
  @Post("appointments")
  @HttpCode(HttpStatus.CREATED)
  async scheduleAppointment(
    @Body() scheduleAppointmentDto: ScheduleAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AppointmentResponseDto> {
    return await this.repairService.scheduleAppointment({
      ...scheduleAppointmentDto,
      userId: user.sub,
    });
  }

  @Get("appointments")
  async getUserAppointments(
    @CurrentUser() user: JwtPayload,
  ): Promise<AppointmentResponseDto[]> {
    return await this.repairService.getUserAppointments(user.sub);
  }

  @Get("appointments/:id")
  async getAppointment(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AppointmentResponseDto> {
    return await this.repairService.getAppointment(id, user.sub);
  }

  @Put("appointments/:id/cancel")
  async cancelAppointment(
    @Param("id") id: string,
    @Body() cancelAppointmentDto: CancelAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return await this.repairService.cancelAppointment(
      id,
      user.sub,
      cancelAppointmentDto.reason,
    );
  }

  // Estimates
  @Post("estimates")
  @HttpCode(HttpStatus.CREATED)
  async createEstimate(
    @Body() createEstimateDto: CreateEstimateDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<EstimateResponseDto> {
    return await this.repairService.createEstimate({
      ...createEstimateDto,
      technicianId: user.sub, // Assuming technician is creating the estimate
    });
  }

  @Get("requests/:repairRequestId/estimates")
  async getEstimatesByRepairRequest(
    @Param("repairRequestId") repairRequestId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EstimateResponseDto[]> {
    return await this.repairService.getEstimatesByRepairRequest(
      repairRequestId,
      user.sub,
    );
  }

  @Get("estimates/:id")
  async getEstimate(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EstimateResponseDto> {
    return await this.repairService.getEstimate(id, user.sub);
  }

  // Utility endpoints
  @Get("time-slots/:technicianId")
  async getAvailableTimeSlots(
    @Param("technicianId") technicianId: string,
    @Query("date") date: string,
  ): Promise<string[]> {
    return await this.repairService.getAvailableTimeSlots(
      technicianId,
      new Date(date),
    );
  }

  @Get("cost-estimate")
  async getRepairCostEstimate(
    @Query("deviceType") deviceType: string,
    @Query("issueType") issueType: string,
  ): Promise<{ min: number; max: number }> {
    return await this.repairService.getRepairCostEstimate(
      deviceType,
      issueType,
    );
  }
}
