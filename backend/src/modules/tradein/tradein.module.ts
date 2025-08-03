import { Module } from "@nestjs/common";
import { TradeInController } from "./tradein.controller";
import { TradeInService } from "./tradein.service";
import { CreateTradeInRequestUseCase } from "../../application/tradein/create-tradein-request.use-case";
import { GetTradeInRequestUseCase } from "../../application/tradein/get-tradein-request.use-case";
import { GetUserTradeInRequestsUseCase } from "../../application/tradein/get-user-tradein-requests.use-case";
import { SearchDevicesUseCase } from "../../application/tradein/search-devices.use-case";
import { EvaluateTradeInUseCase } from "../../application/tradein/evaluate-tradein.use-case";
import { PrismaTradeInRepository } from '../../infrastructure/prisma/repositories/tradein.repository';
import { PrismaTradeInService } from '../../infrastructure/prisma/services/tradein.service';
import { TRADEIN_REPOSITORY, TRADEIN_SERVICE } from '../../domain/tradein/tradein.port';

@Module({
  controllers: [TradeInController],
  providers: [
    TradeInService,

    // Use Cases
    CreateTradeInRequestUseCase,
    GetTradeInRequestUseCase,
    GetUserTradeInRequestsUseCase,
    SearchDevicesUseCase,
    EvaluateTradeInUseCase,

    // Repository binding
    {
      provide: TRADEIN_REPOSITORY,
      useClass: PrismaTradeInRepository,
    },

    // Service binding
    {
      provide: TRADEIN_SERVICE,
      useClass: PrismaTradeInService,
    },
  ],
  exports: [TradeInService, TRADEIN_SERVICE],
})
export class TradeInModule {}
