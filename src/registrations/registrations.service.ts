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
        partnerUserId: partnerUser?.id,
        status: 'REGISTERED',
      },
    });

    return registration;
  }
}
