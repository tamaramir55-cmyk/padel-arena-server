import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async createRegistration(dto: CreateRegistrationDto) {
    // validate tournament exists
    const tournament = await this.prisma.tournament.findUnique({ where: { id: dto.tournamentId } });
    if (!tournament) throw new NotFoundException('Tournament not found');

    // check registrant exists
    const registrant = await this.prisma.user.findUnique({ where: { id: dto.registrantId } });
    if (!registrant) throw new NotFoundException('Registrant not found');

    // Try to find partner user by email if provided
    let partnerUser = null;
    if (dto.partnerEmail) {
      partnerUser = await this.prisma.user.findUnique({ where: { email: dto.partnerEmail } });
    }

    // Create registration
    const registration = await this.prisma.registration.create({
      data: {
        tournamentId: dto.tournamentId,
        registrantId: dto.registrantId,
        partnerName: dto.partnerName,
        partnerEmail: dto.partnerEmail,
        partnerUserId: partnerUser?.id,
        status: 'REGISTERED',
      },
    });

    return registration;
  }

  // Called when payment provider webhook notifies of a successful payment
  async handlePaymentSucceeded(registrationId: string, paymentData: { amount: number; payerId?: string; paymentMethod?: string; providerPaymentId?: string }) {
    return this.prisma.$transaction(async (prisma: PrismaClient): Promise<any> => {
      const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
      if (!registration) throw new NotFoundException('Registration not found');

      // create payment record
      const payment = await prisma.payment.create({
        data: {
          registrationId,
          payerId: paymentData.payerId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          status: 'SUCCEEDED',
        },
      });

      // update registration status
      await prisma.registration.update({ where: { id: registrationId }, data: { status: 'CONFIRMED' } });

      // If partnerUserId exists, and registrant is user, create Couple
      const registrant = await prisma.user.findUnique({ where: { id: registration.registrantId } });
      if (registration.partnerUserId) {
        const partnerUser = await prisma.user.findUnique({ where: { id: registration.partnerUserId } });
        if (partnerUser) {
          // create couple if not exists
          const existing = await prisma.couple.findFirst({ where: { tournamentId: registration.tournamentId, OR: [{ player1Id: registrant.id, player2Id: partnerUser.id }, { player1Id: partnerUser.id, player2Id: registrant.id }] } });
          if (!existing) {
            const couple = await prisma.couple.create({ data: { tournamentId: registration.tournamentId, player1Id: registrant.id, player2Id: partnerUser.id, paymentStatus: 'PENDING' } });
            // link registration to couple
            await prisma.registration.update({ where: { id: registrationId }, data: { coupleId: couple.id } });
            // link payment to couple
            await prisma.payment.update({ where: { id: payment.id }, data: { coupleId: couple.id } });
          }
        }
      }

      return { registration, payment };
    });
  }
}
