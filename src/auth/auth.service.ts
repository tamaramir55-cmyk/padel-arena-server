import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";
import { Provider } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider?: string | null;
};

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("Email already registered");

    const hash = await bcrypt.hash(dto.passwordHash, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        provider: Provider.LOCAL,
      },
    });

    return this.toSafeUser(user as any);
  }

  async login(dto: LoginDto): Promise<SafeUser> {
    const user = (await this.prisma.user.findUnique({
      where: { email: dto.email },
    })) as any;
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const ok = await bcrypt.compare(dto.passwordHash, user.passwordHash || "");
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    return this.toSafeUser(user);
  }

  private toSafeUser(user: any): SafeUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      provider: user.provider,
    };
  }
}
