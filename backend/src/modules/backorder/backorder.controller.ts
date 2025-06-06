/**
 * Controller REST pour le module backorder
 * Gère les endpoints API sans logique métier
 */

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
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { BackorderService } from "./backorder.service";
import {
  CreateBackorderRequestDto,
  UpdateBackorderRequestDto,
  CancelBackorderRequestDto,
  BackorderRequestFiltersDto,
  BackorderRequestResponseDto,
  BackorderRequestListResponseDto,
} from "./dto/backorder.dto";

@Controller("backorder")
@UseGuards(AuthGuard)
export class BackorderController {
  constructor(private readonly backorderService: BackorderService) {}

  /**
   * Créer une nouvelle demande de précommande
   */
  @Post("requests")
  @HttpCode(HttpStatus.CREATED)
  async createBackorderRequest(
    @CurrentUser("sub") userId: string,
    @Body() createDto: CreateBackorderRequestDto,
  ): Promise<BackorderRequestResponseDto> {
    return this.backorderService.createBackorderRequest(userId, createDto);
  }

  /**
   * Récupérer les demandes de précommande de l'utilisateur
   */
  @Get("requests")
  async getUserBackorderRequests(
    @CurrentUser("sub") userId: string,
    @Query() filters: BackorderRequestFiltersDto,
  ): Promise<BackorderRequestListResponseDto> {
    return this.backorderService.getUserBackorderRequests(userId, filters);
  }

  /**
   * Récupérer une demande de précommande spécifique
   */
  @Get("requests/:id")
  async getBackorderRequest(
    @CurrentUser("sub") userId: string,
    @Param("id") requestId: string,
  ): Promise<BackorderRequestResponseDto> {
    return this.backorderService.getBackorderRequest(requestId, userId);
  }

  /**
   * Mettre à jour une demande de précommande
   */
  @Put("requests/:id")
  async updateBackorderRequest(
    @CurrentUser("sub") userId: string,
    @Param("id") requestId: string,
    @Body() updateDto: UpdateBackorderRequestDto,
  ): Promise<BackorderRequestResponseDto> {
    return this.backorderService.updateBackorderRequest(
      requestId,
      userId,
      updateDto,
    );
  }

  /**
   * Annuler une demande de précommande
   */
  @Delete("requests/:id")
  @HttpCode(HttpStatus.OK)
  async cancelBackorderRequest(
    @CurrentUser("sub") userId: string,
    @Param("id") requestId: string,
    @Body() cancelDto: CancelBackorderRequestDto,
  ): Promise<BackorderRequestResponseDto> {
    return this.backorderService.cancelBackorderRequest(
      requestId,
      userId,
      cancelDto,
    );
  }

  /**
   * Obtenir le résumé des précommandes de l'utilisateur
   */
  @Get("summary")
  async getBackorderSummary(@CurrentUser("sub") userId: string): Promise<any> {
    return this.backorderService.getBackorderSummary(userId);
  }
}
