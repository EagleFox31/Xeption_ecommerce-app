# Documentation des Endpoints et DTOs avec Swagger

## Table des matières
1. [Documentation des Endpoints](#documentation-des-endpoints)
   - [Marketing](#marketing-endpoints)
   - [RFQ (Demandes de Devis)](#rfq-endpoints)
   - [TradeIn (Reprise d'appareils)](#tradein-endpoints)
   - [CartOrder (Panier et Commandes)](#cartorder-endpoints)
2. [Documentation des DTOs](#documentation-des-dtos)
   - [Marketing DTOs](#marketing-dtos)
   - [RFQ DTOs](#rfq-dtos)
   - [TradeIn DTOs](#tradein-dtos)
   - [CartOrder DTOs](#cartorder-dtos)

## Documentation des Endpoints

Les endpoints de l'API doivent être documentés à l'aide des décorateurs Swagger pour fournir une documentation claire et interactive. Voici comment documenter les différents modules de l'application.

### Marketing Endpoints

Le module Marketing gère les bannières publicitaires affichées sur le site e-commerce.

```typescript
import { 
  Controller, Get, Post, Put, Patch, Delete, 
  Body, Param, Query, UseGuards, HttpStatus, HttpCode 
} from "@nestjs/common";
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody 
} from "@nestjs/swagger";
import { AuthGuard } from "../../common/auth/auth.guard";
import { RoleGuard } from "../../common/auth/role.guard";
import { Roles } from "../../common/auth/roles.decorator";
import { 
  CreateMarketingBannerDto, UpdateMarketingBannerDto,
  ToggleBannerStatusDto, MarketingBannerResponseDto
} from "./dto/marketing.dto";

@ApiTags('marketing')
@Controller("marketing")
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  /**
   * PUBLIC ENDPOINTS
   */
  @Get("banners")
  @ApiOperation({ 
    summary: "Récupérer les bannières actives", 
    description: "Retourne toutes les bannières actives pour l'affichage public. Peut être filtré par catégorie."
  })
  @ApiQuery({ 
    name: "category", 
    required: false, 
    description: "ID de la catégorie pour filtrer les bannières"
  })
  @ApiResponse({ 
    status: 200, 
    description: "Liste des bannières actives", 
    type: [MarketingBannerResponseDto]
  })
  async getActiveBanners(
    @Query("category") categoryId?: string,
  ): Promise<MarketingBannerResponseDto[]> {
    // Implementation
  }

  /**
   * ADMIN ENDPOINTS
   */
  @Get("admin/banners")
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: "Récupérer toutes les bannières (admin)", 
    description: "Retourne toutes les bannières pour la gestion administrative"
  })
  @ApiResponse({ 
    status: 200, 
    description: "Liste de toutes les bannières", 
    type: [MarketingBannerResponseDto]
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  async getAllBanners(): Promise<MarketingBannerResponseDto[]> {
    // Implementation
  }

  @Post("admin/banners")
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: "Créer une nouvelle bannière", 
    description: "Crée une nouvelle bannière marketing"
  })
  @ApiBody({ type: CreateMarketingBannerDto })
  @ApiResponse({ 
    status: 201, 
    description: "Bannière créée avec succès", 
    type: MarketingBannerResponseDto
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  async createBanner(
    @Body() createBannerDto: CreateMarketingBannerDto,
  ): Promise<MarketingBannerResponseDto> {
    // Implementation
  }

  @Put("admin/banners/:id")
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: "Mettre à jour une bannière", 
    description: "Met à jour une bannière marketing existante"
  })
  @ApiParam({ name: "id", description: "ID de la bannière à mettre à jour" })
  @ApiBody({ type: UpdateMarketingBannerDto })
  @ApiResponse({ 
    status: 200, 
    description: "Bannière mise à jour avec succès", 
    type: MarketingBannerResponseDto
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  @ApiResponse({ status: 404, description: "Bannière non trouvée" })
  async updateBanner(
    @Param("id") id: string,
    @Body() updateBannerDto: UpdateMarketingBannerDto,
  ): Promise<MarketingBannerResponseDto> {
    // Implementation
  }

  @Patch("admin/banners/:id/status")
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: "Activer/désactiver une bannière", 
    description: "Change le statut d'activation d'une bannière"
  })
  @ApiParam({ name: "id", description: "ID de la bannière" })
  @ApiBody({ type: ToggleBannerStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: "Statut modifié avec succès", 
    type: MarketingBannerResponseDto
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Bannière non trouvée" })
  async toggleBannerStatus(
    @Param("id") id: string,
    @Body() toggleStatusDto: ToggleBannerStatusDto,
  ): Promise<MarketingBannerResponseDto> {
    // Implementation
  }

  @Delete("admin/banners/:id")
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: "Supprimer une bannière", 
    description: "Supprime définitivement une bannière"
  })
  @ApiParam({ name: "id", description: "ID de la bannière à supprimer" })
  @ApiResponse({ status: 204, description: "Bannière supprimée avec succès" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  @ApiResponse({ status: 404, description: "Bannière non trouvée" })
  async deleteBanner(@Param("id") id: string): Promise<void> {
    // Implementation
  }
}
```

### RFQ Endpoints

Le module RFQ (Request For Quote) gère les demandes de devis pour les clients professionnels.

```typescript
import {
  Controller, Get, Post, Put, Param, Body, Query,
  UseGuards, HttpStatus, HttpCode,
} from "@nestjs/common";
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody
} from "@nestjs/swagger";
import { AuthGuard } from "../../common/auth/auth.guard";
import { RoleGuard } from "../../common/auth/role.guard";
import { Roles } from "../../common/auth/roles.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { RFQStatus } from "../../domain/rfq/rfq.entity";
import {
  CreateRFQRequestDto, UpdateRFQRequestDto,
  RFQRequestResponseDto, RFQResponseDto,
  CreateRFQResponseDto
} from "./dto/rfq.dto";
import { UpdateRFQStatusDto, SubmitRFQDto } from "./dto/status-update.dto";

@ApiTags('rfq')
@Controller("rfq")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  /**
   * CLIENT RFQ OPERATIONS
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Créer une demande de devis",
    description: "Crée une nouvelle demande de devis (RFQ) pour un client"
  })
  @ApiBody({ type: CreateRFQRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: "Demande de devis créée avec succès", 
    type: RFQRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async createRFQRequest(
    @Body() createRFQRequestDto: CreateRFQRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    // Implementation
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtenir une demande de devis",
    description: "Récupère les détails d'une demande de devis spécifique"
  })
  @ApiParam({ name: "id", description: "ID de la demande de devis" })
  @ApiResponse({ 
    status: 200, 
    description: "Détails de la demande de devis", 
    type: RFQRequestResponseDto 
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async getRFQRequest(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    // Implementation
  }

  @Get("my/requests")
  @ApiOperation({
    summary: "Mes demandes de devis",
    description: "Récupère toutes les demandes de devis de l'utilisateur connecté"
  })
  @ApiResponse({ 
    status: 200, 
    description: "Liste des demandes de devis de l'utilisateur", 
    type: [RFQRequestResponseDto] 
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async getUserRFQRequests(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto[]> {
    // Implementation
  }

  @Put(":id")
  @ApiOperation({
    summary: "Mettre à jour une demande de devis",
    description: "Met à jour une demande de devis existante"
  })
  @ApiParam({ name: "id", description: "ID de la demande de devis" })
  @ApiBody({ type: UpdateRFQRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: "Demande mise à jour avec succès", 
    type: RFQRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async updateRFQRequest(
    @Param("id") id: string,
    @Body() updateRFQRequestDto: UpdateRFQRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    // Implementation
  }

  /**
   * ADMIN RFQ OPERATIONS
   */
  @Get("admin/all")
  @Roles('admin', 'agent')
  @UseGuards(RoleGuard)
  @ApiOperation({
    summary: "Toutes les demandes de devis (admin)",
    description: "Récupère toutes les demandes de devis (réservé aux administrateurs et agents)"
  })
  @ApiQuery({ 
    name: "status", 
    required: false, 
    enum: RFQStatus,
    description: "Filtrer par statut" 
  })
  @ApiResponse({ 
    status: 200, 
    description: "Liste des demandes de devis", 
    type: [RFQResponseDto] 
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  async getAllRFQs(
    @Query("status") status: RFQStatus,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQResponseDto[]> {
    // Implementation
  }

  @Post(":id/response")
  @Roles('admin', 'agent')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Répondre à une demande de devis",
    description: "Crée une réponse à une demande de devis (réservé aux administrateurs et agents)"
  })
  @ApiParam({ name: "id", description: "ID de la demande de devis" })
  @ApiBody({ type: CreateRFQResponseDto })
  @ApiResponse({ 
    status: 201, 
    description: "Réponse créée avec succès", 
    type: RFQResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async createRFQResponse(
    @Param("id") rfqRequestId: string,
    @Body() createRFQResponseDto: CreateRFQResponseDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQResponseDto> {
    // Implementation
  }

  /**
   * STATUS TRANSITION OPERATIONS
   */
  @Put(":id/status")
  @Roles('admin')
  @UseGuards(RoleGuard)
  @ApiOperation({
    summary: "Mettre à jour le statut d'une demande",
    description: "Met à jour le statut d'une demande de devis (réservé aux administrateurs)"
  })
  @ApiParam({ name: "id", description: "ID de la demande de devis" })
  @ApiBody({ type: UpdateRFQStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: "Statut mis à jour avec succès", 
    type: RFQRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async updateRFQStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateRFQStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    // Implementation
  }

  @Put(":id/submit")
  @ApiOperation({
    summary: "Soumettre une demande de devis",
    description: "Soumet une demande de devis (passe du statut DRAFT à SUBMITTED)"
  })
  @ApiParam({ name: "id", description: "ID de la demande de devis" })
  @ApiBody({ type: SubmitRFQDto })
  @ApiResponse({ 
    status: 200, 
    description: "Demande soumise avec succès", 
    type: RFQRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async submitRFQ(
    @Param("id") id: string,
    @Body() submitDto: SubmitRFQDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    // Implementation
  }
}
```

### TradeIn Endpoints

Le module TradeIn gère le service de reprise d'appareils électroniques.

```typescript
import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpStatus, HttpCode,
} from "@nestjs/common";
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody
} from "@nestjs/swagger";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtPayload } from "../../common/auth/jwt.types";
import {
  CreateTradeInRequestDto, SearchDevicesDto,
  EvaluateTradeInDto, UpdateTradeInStatusDto,
  TradeInRequestResponseDto, DeviceResponseDto,
} from "./dto/tradein.dto";

@ApiTags('tradein')
@Controller("tradein")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TradeInController {
  constructor(private readonly tradeInService: TradeInService) {}

  /**
   * REQUEST OPERATIONS
   */
  @Post("requests")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Créer une demande de reprise",
    description: "Crée une nouvelle demande de reprise d'appareil"
  })
  @ApiBody({ type: CreateTradeInRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: "Demande de reprise créée avec succès", 
    type: TradeInRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async createTradeInRequest(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateTradeInRequestDto,
  ): Promise<TradeInRequestResponseDto> {
    // Implementation
  }

  @Get("requests")
  @ApiOperation({
    summary: "Mes demandes de reprise",
    description: "Récupère les demandes de reprise de l'utilisateur connecté"
  })
  @ApiResponse({ 
    status: 200, 
    description: "Liste des demandes de reprise de l'utilisateur", 
    type: [TradeInRequestResponseDto] 
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async getUserTradeInRequests(
    @CurrentUser() user: JwtPayload,
  ): Promise<TradeInRequestResponseDto[]> {
    // Implementation
  }

  @Get("requests/:id")
  @ApiOperation({
    summary: "Détails d'une demande de reprise",
    description: "Récupère les détails d'une demande de reprise spécifique"
  })
  @ApiParam({ name: "id", description: "ID de la demande de reprise" })
  @ApiResponse({ 
    status: 200, 
    description: "Détails de la demande de reprise", 
    type: TradeInRequestResponseDto 
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async getTradeInRequest(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ): Promise<TradeInRequestResponseDto> {
    // Implementation
  }

  /**
   * DEVICE OPERATIONS
   */
  @Get("devices/search")
  @ApiOperation({
    summary: "Rechercher des appareils",
    description: "Recherche des appareils pour la reprise"
  })
  @ApiQuery({ 
    name: "query", 
    required: true, 
    description: "Terme de recherche" 
  })
  @ApiQuery({ 
    name: "category", 
    required: false, 
    description: "Catégorie d'appareil" 
  })
  @ApiResponse({ 
    status: 200, 
    description: "Appareils correspondants", 
    type: [DeviceResponseDto] 
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async searchDevices(
    @Query() searchDto: SearchDevicesDto,
  ): Promise<DeviceResponseDto[]> {
    // Implementation
  }

  @Get("devices/category/:category")
  @ApiOperation({
    summary: "Appareils par catégorie",
    description: "Récupère les appareils par catégorie"
  })
  @ApiParam({ name: "category", description: "Catégorie d'appareil" })
  @ApiResponse({ 
    status: 200, 
    description: "Appareils de la catégorie", 
    type: [DeviceResponseDto] 
  })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async getDevicesByCategory(
    @Param("category") category: string,
  ): Promise<DeviceResponseDto[]> {
    // Implementation
  }

  /**
   * EVALUATION OPERATIONS
   */
  @Put("requests/:id/evaluate")
  @ApiOperation({
    summary: "Évaluer une demande de reprise",
    description: "Évalue une demande de reprise (réservé aux évaluateurs)"
  })
  @ApiParam({ name: "id", description: "ID de la demande de reprise" })
  @ApiBody({ type: EvaluateTradeInDto })
  @ApiResponse({ 
    status: 200, 
    description: "Évaluation effectuée avec succès", 
    type: TradeInRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async evaluateTradeIn(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() evaluateDto: EvaluateTradeInDto,
  ): Promise<TradeInRequestResponseDto> {
    // Implementation
  }

  @Put("requests/:id/status")
  @ApiOperation({
    summary: "Mettre à jour le statut d'une demande",
    description: "Met à jour le statut d'une demande de reprise (réservé aux administrateurs)"
  })
  @ApiParam({ name: "id", description: "ID de la demande de reprise" })
  @ApiBody({ type: UpdateTradeInStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: "Statut mis à jour avec succès", 
    type: TradeInRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 403, description: "Accès interdit" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  async updateTradeInStatus(
    @Param("id") id: string,
    @Body() updateDto: UpdateTradeInStatusDto,
  ): Promise<TradeInRequestResponseDto> {
    // Implementation
  }
}
```

### CartOrder Endpoints

Le module CartOrder gère les paniers d'achat et les commandes.

```typescript
import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseGuards, HttpStatus, HttpCode, Res, StreamableFile, Query,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody, ApiProduces, ApiConsumes
} from "@nestjs/swagger";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtPayload } from "../../common/auth/jwt.types";
import {
  CreateCartDto, AddCartItemDto, UpdateCartItemDto, RemoveCartItemDto
} from "./dto/cart.dto";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/order.dto";
import { CreatePaymentDto, ProcessPaymentDto } from "./dto/payment.dto";

@ApiTags('cartorder')
@Controller("api/cartorder")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CartOrderController {
  constructor(
    private readonly cartOrderService: CartOrderService,
    private readonly invoiceService: InvoiceService
  ) {}

  /**
   * CART OPERATIONS
   */
  @Post("cart")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Créer un panier",
    description: "Crée un nouveau panier pour l'utilisateur connecté"
  })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({ status: 201, description: "Panier créé avec succès" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async createCart(
    @CurrentUser() user: JwtPayload,
    @Body() createCartDto: CreateCartDto,
  ) {
    // Implementation
  }

  @Get("cart")
  @ApiOperation({
    summary: "Obtenir mon panier",
    description: "Récupère le panier actuel de l'utilisateur connecté"
  })
  @ApiResponse({ status: 200, description: "Panier récupéré avec succès" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Panier non trouvé" })
  async getCurrentCart(@CurrentUser() user: JwtPayload) {
    // Implementation
  }

  @Post("cart/items")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Ajouter un article au panier",
    description: "Ajoute un article au panier de l'utilisateur connecté"
  })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, description: "Article ajouté avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async addSingleCartItem(
    @CurrentUser() user: JwtPayload,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    // Implementation
  }

  @Put("cart/:cartId/items/:itemId")
  @ApiOperation({
    summary: "Mettre à jour un article du panier",
    description: "Met à jour la quantité d'un article dans le panier"
  })
  @ApiParam({ name: "cartId", description: "ID du panier" })
  @ApiParam({ name: "itemId", description: "ID de l'article" })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: "Article mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Article non trouvé" })
  async updateCartItem(
    @Param("cartId") cartId: string,
    @Param("itemId") itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    // Implementation
  }

  @Delete("cart/:cartId/items/:itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Supprimer un article du panier",
    description: "Supprime un article du panier"
  })
  @ApiParam({ name: "cartId", description: "ID du panier" })
  @ApiParam({ name: "itemId", description: "ID de l'article" })
  @ApiResponse({ status: 204, description: "Article supprimé avec succès" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Article non trouvé" })
  async removeCartItem(
    @Param("cartId") cartId: string,
    @Param("itemId") itemId: string,
  ) {
    // Implementation
  }

  /**
   * CHECKOUT OPERATIONS
   */
  @Post("checkout")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Passer à la caisse",
    description: "Convertit un panier en commande"
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: "Commande créée avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Panier non trouvé" })
  async checkout(
    @CurrentUser() user: JwtPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // Implementation
  }

  /**
   * ORDER OPERATIONS
   */
  @Get("orders")
  @ApiOperation({
    summary: "Mes commandes",
    description: "Récupère les commandes de l'utilisateur connecté"
  })
  @ApiResponse({ status: 200, description: "Liste des commandes" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  async getUserOrders(@CurrentUser() user: JwtPayload) {
    // Implementation
  }

  @Get("orders/:orderId")
  @ApiOperation({
    summary: "Détails d'une commande",
    description: "Récupère les détails d'une commande spécifique"
  })
  @ApiParam({ name: "orderId", description: "ID de la commande" })
  @ApiResponse({ status: 200, description: "Détails de la commande" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Commande non trouvée" })
  async getOrder(@Param("orderId") orderId: string) {
    // Implementation
  }

  @Get("orders/:orderId/invoice")
  @ApiOperation({
    summary: "Facture d'une commande",
    description: "Récupère la facture d'une commande au format JSON ou PDF"
  })
  @ApiParam({ name: "orderId", description: "ID de la commande" })
  @ApiQuery({ 
    name: "format", 
    required: false, 
    description: "Format de la facture (pdf pour PDF, omis pour JSON)" 
  })
  @ApiResponse({ status: 200, description: "Facture récupérée avec succès" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Commande non trouvée" })
  @ApiProduces('application/json', 'application/pdf')
  async getOrderInvoice(
    @Param("orderId") orderId: string,
    @Query("format") format?: string,
    @Res({ passthrough: true }) res?: Response
  ) {
    // Implementation
  }

  /**
   * PAYMENT OPERATIONS
   */
  @Post("payments")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Créer un paiement",
    description: "Crée un nouveau paiement pour une commande"
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: "Paiement créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiResponse({ status: 404, description: "Commande non trouvée" })
  async createPayment(
    @CurrentUser() user: JwtPayload,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    // Implementation
  }

  @Post("payments/:paymentId/process")
  @ApiOperation({
    summary: "Traiter un paiement",
    description: "Traite un paiement existant (webhook de confirmation)"
  })
  @ApiParam({ name: "paymentId", description: "ID du paiement" })
  @ApiBody({ type: ProcessPaymentDto })
  @ApiResponse({ status: 200, description: "Paiement traité avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 404, description: "Paiement non trouvé" })
  async processPayment(
    @Param("paymentId") paymentId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    // Implementation
  }
}
```

## Documentation des DTOs

Les DTOs (Data Transfer Objects) doivent également être documentés avec les décorateurs Swagger pour générer des schémas clairs et compréhensibles.

### Marketing DTOs

```typescript
import {
  IsString, IsOptional, IsBoolean, IsNumber,
  IsDateString, IsUrl, Min
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMarketingBannerDto {
  @ApiProperty({
    description: "Titre de la bannière (en français et anglais)",
    example: "Promotion de Printemps"
  })
  @IsString()
  title_237: string;

  @ApiProperty({
    description: "Description détaillée de la bannière",
    example: "Profitez de 20% de réduction sur tous les smartphones",
    required: false
  })
  @IsOptional()
  @IsString()
  description_237?: string;

  @ApiProperty({
    description: "URL de l'image de la bannière",
    example: "https://storage.xeption.cm/banners/spring-promo.jpg"
  })
  @IsUrl()
  image_url: string;

  @ApiProperty({
    description: "URL de destination au clic sur la bannière",
    example: "https://xeption.cm/promotions/printemps",
    required: false
  })
  @IsOptional()
  @IsUrl()
  cta_url?: string;

  @ApiProperty({
    description: "ID de la catégorie associée à la bannière",
    example: "smartphones",
    required: false
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({
    description: "Priorité d'affichage (0 = plus faible, 100 = plus élevée)",
    example: 50,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  priority: number;

  @ApiProperty({
    description: "Date de début d'affichage (format ISO)",
    example: "2025-07-01T00:00:00Z"
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: "Date de fin d'affichage (format ISO)",
    example: "2025-07-31T23:59:59Z"
  })
  @IsDateString()
  end_date: string;

  @ApiProperty({
    description: "Indique si la bannière est active",
    example: true
  })
  @IsBoolean()
  active: boolean;
}

export class UpdateMarketingBannerDto {
  @ApiProperty({
    description: "Titre de la bannière (en français et anglais)",
    example: "Promotion de Printemps - Mise à jour",
    required: false
  })
  @IsOptional()
  @IsString()
  title_237?: string;

  // Autres propriétés similaires à CreateMarketingBannerDto mais toutes optionnelles
  // ...
}

export class ToggleBannerStatusDto {
  @ApiProperty({
    description: "Nouvel état d'activation de la bannière",
    example: false
  })
  @IsBoolean()
  active: boolean;
}

export class MarketingBannerResponseDto {
  @ApiProperty({
    description: "Identifiant unique de la bannière",
    example: "b12c8e7f-b0ea-4f2e-a810-5df329c973e2"
  })
  id: string;

  @ApiProperty({
    description: "Titre de la bannière (en français et anglais)",
    example: "Promotion de Printemps"
  })
  title_237: string;

  // Autres propriétés...
}
```

### RFQ DTOs

```typescript
import {
  IsString, IsEmail, IsOptional, IsNumber, IsBoolean,
  IsArray, ValidateNested, IsEnum, IsDateString, Min
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RFQStatus } from "../../../domain/rfq/rfq.entity";

export class CreateRFQItemDto {
  @ApiProperty({
    description: "ID de la catégorie de produit",
    example: 5
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: "Quantité demandée",
    example: 10,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiPropertyOptional({
    description: "Spécifications techniques demandées",
    example: "Processeur i7 ou équivalent, min 16GB RAM"
  })
  @IsOptional()
  @IsString()
  specsNote?: string;
}

export class CreateRFQRequestDto {
  @ApiProperty({
    description: "Nom de l'entreprise",
    example: "ACME Corporation"
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    description: "Nom du contact",
    example: "John Doe"
  })
  @IsString()
  contactName: string;

  @ApiProperty({
    description: "Email du contact",
    example: "john.doe@acme.com"
  })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({
    description: "Budget minimum (en FCFA)",
    example: 500000
  })
  @IsOptional()
  @IsNumber()
  budgetMinXaf?: number;

  @ApiPropertyOptional({
    description: "Budget maximum (en FCFA)",
    example: 1000000
  })
  @IsOptional()
  @IsNumber()
  budgetMaxXaf?: number;

  @ApiPropertyOptional({
    description: "Indique si la demande est urgente",
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional({
    description: "Commentaires additionnels",
    example: "Nous avons besoin de ces équipements pour notre nouveau bureau."
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: "Date limite souhaitée (format ISO)",
    example: "2025-08-15T00:00:00Z"
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    description: "Liste des articles demandés",
    type: [CreateRFQItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRFQItemDto)
  items: CreateRFQItemDto[];
}

// Autres DTOs...
```

### TradeIn DTOs

```typescript
import {
  IsString, IsEnum, IsOptional, IsArray, IsNumber,
  Min, Max, IsUUID
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  DeviceCondition, TradeInStatus
} from "../../../domain/tradein/tradein.entity";

export class CreateTradeInRequestDto {
  @ApiProperty({
    description: "ID de l'appareil à reprendre",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  })
  @IsUUID()
  deviceId: string;

  @ApiProperty({
    description: "État de l'appareil",
    enum: DeviceCondition,
    example: "GOOD"
  })
  @IsEnum(DeviceCondition)
  condition: DeviceCondition;

  @ApiPropertyOptional({
    description: "Description de l'état de l'appareil",
    example: "Quelques rayures sur l'écran, fonctionne parfaitement"
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "URLs des photos de l'appareil",
    example: ["https://storage.xeption.cm/tradein/photo1.jpg", "https://storage.xeption.cm/tradein/photo2.jpg"]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

// Autres DTOs...
```

### CartOrder DTOs

```typescript
import {
  IsString, IsNumber, IsPositive, IsOptional, IsObject,
  IsEnum
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "../../../domain/cartorder/order.entity";
import {
  PaymentMethod, PaymentProvider, PaymentStatus
} from "../../../domain/cartorder/payment.entity";

// Cart DTOs
export class CreateCartDto {
  // Le panier est créé automatiquement pour l'utilisateur authentifié
  @ApiProperty({
    description: "Aucune donnée requise - le panier est créé pour l'utilisateur connecté"
  })
  _empty?: boolean;
}

export class AddCartItemDto {
  @ApiProperty({
    description: "ID du produit à ajouter au panier",
    example: "prod_12345"
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: "Quantité désirée",
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: "Prix unitaire en FCFA",
    example: 150000
  })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

// Order DTOs
export class ShippingAddressDto {
  @ApiProperty({
    description: "Rue et numéro",
    example: "123 Rue Principale"
  })
  @IsString()
  street: string;

  @ApiProperty({
    description: "Ville",
    example: "Douala"
  })
  @IsString()
  city: string;

  // Autres propriétés...
}

export class CreateOrderDto {
  @ApiProperty({
    description: "ID du panier à convertir en commande",
    example: "cart_67890"
  })
  @IsString()
  cartId: string;

  @ApiProperty({
    description: "Adresse de livraison",
    type: ShippingAddressDto
  })
  @IsObject()
  shippingAddress: ShippingAddressDto;

  // Autres propriétés...
}

// Payment DTOs
export class CreatePaymentDto {
  @ApiProperty({
    description: "ID de la commande à payer",
    example: "order_12345"
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: "Montant du paiement en FCFA",
    example: 450000
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: "Devise",
    example: "XAF"
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: "Méthode de paiement",
    enum: PaymentMethod,
    example: "MOBILE_MONEY"
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // Autres propriétés...
}

// Autres DTOs...
```

## Conclusion

Ces exemples montrent comment implémenter correctement la documentation OpenAPI/Swagger pour les endpoints et les DTOs de l'API Xeption E-commerce. Les points clés à retenir sont:

1. **Pour les controllers**:
   - Utiliser `@ApiTags` pour catégoriser les endpoints
   - Documenter chaque endpoint avec `@ApiOperation`, `@ApiResponse`, etc.
   - Spécifier les paramètres avec `@ApiParam` et `@ApiQuery`
   - Indiquer les besoins d'authentification avec `@ApiBearerAuth`

2. **Pour les DTOs**:
   - Utiliser `@ApiProperty` pour documenter chaque propriété
   - Fournir des descriptions claires et des exemples pertinents
   - Indiquer les champs optionnels avec `@ApiPropertyOptional`
   - Spécifier les contraintes (min, max, enum, etc.)

Cette documentation facilitera l'utilisation de l'API tant pour les développeurs frontend que pour les intégrations externes.