import { Module } from "@nestjs/common";
import { RFQController } from "./rfq.controller";
import { RFQService } from "./rfq.service";
import { CreateRFQRequestUseCase } from "../../application/rfq/create-rfq-request.use-case";
import { GetRFQRequestUseCase } from "../../application/rfq/get-rfq-request.use-case";
import { GetUserRFQRequestsUseCase } from "../../application/rfq/get-user-rfq-requests.use-case";
import { UpdateRFQRequestUseCase } from "../../application/rfq/update-rfq-request.use-case";
import { GetAllRFQsUseCase } from "../../application/rfq/get-all-rfqs.use-case";
import { CreateRFQResponseUseCase } from "../../application/rfq/create-rfq-response.use-case";
import { SupabaseRFQRepository } from "../../infrastructure/supabase/repositories/rfq.repository";
import { RFQRepository } from "../../domain/rfq/rfq.port";

@Module({
  controllers: [RFQController],
  providers: [
    RFQService,
    // Use Cases
    CreateRFQRequestUseCase,
    GetRFQRequestUseCase,
    GetUserRFQRequestsUseCase,
    UpdateRFQRequestUseCase,
    GetAllRFQsUseCase,
    CreateRFQResponseUseCase,
    // Repository
    {
      provide: RFQRepository,
      useClass: SupabaseRFQRepository,
    },
  ],
  exports: [RFQService],
})
export class RFQModule {}
