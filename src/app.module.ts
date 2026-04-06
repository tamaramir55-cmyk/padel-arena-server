import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma";
import { UsersModule } from "./users/users.module";
import { RegistrationsModule } from "./registrations/registrations.module";

@Module({
  imports: [PrismaModule, UsersModule, RegistrationsModule],
})
export class AppModule {}
