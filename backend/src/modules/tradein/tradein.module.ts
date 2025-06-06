import { Module } from "@nestjs/common";
import { TradeInController } from "./tradein.controller";
import { TradeInService } from "./tradein.service";
import { CreateTradeInRequestUseCase } from "../../application/tradein/create-tradein-request.use-case";
import { GetTradeInRequestUseCase } from "../../application/tradein/get-tradein-request.use-case";
import { GetUserTradeInRequestsUseCase } from "../../application/tradein/get-user-tradein-requests.use-case";
import { SearchDevicesUseCase } from "../../application/tradein/search-devices.use-case";
import { EvaluateTradeInUseCase } from "../../application/tradein/evaluate-tradein.use-case";
import { TradeInRepository } from "../../infrastructure/supabase/repositories/tradein.repository";
import { TradeInRepositoryPort } from "../../domain/tradein/tradein.port";

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

    // Repository
    {
      provide: TradeInRepositoryPort,
      useClass: TradeInRepository,
    },
  ],
  exports: [TradeInService],
})
export class TradeInModule {}
