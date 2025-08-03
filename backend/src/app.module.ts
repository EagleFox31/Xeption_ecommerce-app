import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RoleGuard } from "./common/auth/role.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CartOrderModule } from "./modules/cartorder/cartorder.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { TradeInModule } from "./modules/tradein/tradein.module";
import { AdvisoryModule } from "./modules/advisory/advisory.module";
import { RFQModule } from "./modules/rfq/rfq.module";
import { MarketingModule } from "./modules/marketing/marketing.module";
import { configValidation } from "./config/config.validation";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
      envFilePath: [".env.production", ".env"],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    CartOrderModule,
    DeliveryModule,
    TradeInModule,
    AdvisoryModule,
    RFQModule,
    MarketingModule,
  ],
  controllers: [],
  providers: [
    RoleGuard, // Provide RoleGuard globally
  ],
})
export class AppModule {}
