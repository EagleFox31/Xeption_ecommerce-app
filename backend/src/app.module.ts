import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CartOrderModule } from "./modules/cartorder/cartorder.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { TradeInModule } from "./modules/tradein/tradein.module";
import { AdvisoryModule } from "./modules/advisory/advisory.module";
import { RFQModule } from "./modules/rfq/rfq.module";
import { configValidation } from "./config/config.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
      envFilePath: ".env",
    }),
    AuthModule,
    UsersModule,
    CatalogModule,
    CartOrderModule,
    DeliveryModule,
    TradeInModule,
    AdvisoryModule,
    RFQModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
