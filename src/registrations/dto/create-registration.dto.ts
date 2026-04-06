import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRegistrationDto {
  @IsUUID()
  tournamentId!: string;

  @IsUUID()
  registrantId!: string;

  @IsOptional()
  @IsString()
  partnerName?: string;

  @IsOptional()
  @IsString()
  partnerEmail?: string;
}
