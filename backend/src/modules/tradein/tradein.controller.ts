import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtPayload } from "../../common/auth/jwt.types";
import { TradeInService } from "./tradein.service";
import {
  CreateTradeInRequestDto,
  SearchDevicesDto,
  EvaluateTradeInDto,
  UpdateTradeInStatusDto,
  TradeInRequestResponseDto,
  DeviceResponseDto,
} from "./dto/tradein.dto";

/**
 * TradeIn API Controller
 *
 * Endpoints are organized by resource type:
 * 1. Request operations (/tradein/requests/*)
 * 2. Device operations (/tradein/devices/*)
 */
@Controller("tradein")
@UseGuards(AuthGuard)
export class TradeInController {
  constructor(private readonly tradeInService: TradeInService) {}

  /**
   * REQUESTS OPERATIONS
   * Endpoints pour la gestion des demandes de reprise
   */

  /**
   * Créer une nouvelle demande de reprise
   */
  @Post("requests")
  @HttpCode(HttpStatus.CREATED)
  async createTradeInRequest(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateTradeInRequestDto,
  ): Promise<TradeInRequestResponseDto> {
    return await this.tradeInService.createTradeInRequest(
      user.sub,
      createDto.deviceId,
      createDto.condition,
      createDto.description,
      createDto.images,
    );
  }

  /**
   * Récupérer les demandes de reprise de l'utilisateur connecté
   */
  @Get("requests")
  async getUserTradeInRequests(
    @CurrentUser() user: JwtPayload,
  ): Promise<TradeInRequestResponseDto[]> {
    return await this.tradeInService.getUserTradeInRequests(user.sub);
  }

  /**
   * Récupérer une demande de reprise spécifique
   */
  @Get("requests/:id")
  async getTradeInRequest(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ): Promise<TradeInRequestResponseDto> {
    return await this.tradeInService.getTradeInRequest(id, user.sub);
  }

  /**
   * DEVICES OPERATIONS
   * Endpoints pour la recherche et la consultation des appareils
   */

  /**
   * Rechercher des appareils pour la reprise
   */
  @Get("devices/search")
  async searchDevices(
    @Query() searchDto: SearchDevicesDto,
  ): Promise<DeviceResponseDto[]> {
    return await this.tradeInService.searchDevices(
      searchDto.query,
      searchDto.category,
    );
  }

  /**
   * Récupérer les appareils par catégorie
   */
  @Get("devices/category/:category")
  async getDevicesByCategory(
    @Param("category") category: string,
  ): Promise<DeviceResponseDto[]> {
    return await this.tradeInService.getDevicesByCategory(category);
  }

  /**
   * Évaluer une demande de reprise (admin/évaluateur seulement)
   */
  @Put("requests/:id/evaluate")
  async evaluateTradeIn(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() evaluateDto: EvaluateTradeInDto,
  ): Promise<TradeInRequestResponseDto> {
    return await this.tradeInService.evaluateTradeIn(
      id,
      user.sub,
      evaluateDto.condition,
      evaluateDto.functionalityScore,
      evaluateDto.cosmeticScore,
      evaluateDto.notes,
    );
  }

  /**
   * Mettre à jour le statut d'une demande de reprise (admin seulement)
   */
  @Put("requests/:id/status")
  async updateTradeInStatus(
    @Param("id") id: string,
    @Body() updateDto: UpdateTradeInStatusDto,
  ): Promise<TradeInRequestResponseDto> {
    return await this.tradeInService.updateTradeInStatus(
      id,
      updateDto.status,
      updateDto.evaluatorNotes,
    );
  }
}
