import { Controller, Post, Body, Param } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly svc: RegistrationsService) {}

  @Post()
  create(@Body() dto: CreateRegistrationDto) {
    return this.svc.createRegistration(dto);
  }

  // webhook endpoint to inform that payment succeeded
  @Post(':id/payment-succeeded')
  paymentSucceeded(@Param('id') id: string, @Body() body: any) {
    return this.svc.handlePaymentSucceeded(id, body);
  }
}
