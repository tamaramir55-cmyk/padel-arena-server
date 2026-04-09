import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
})
export class AppModule {}
