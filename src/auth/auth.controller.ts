import { Controller, Post, Body } from "@nestjs/common";
import { AuthService, SafeUser } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post("signup")
  signup(@Body() dto: SignupDto): Promise<SafeUser> {
    return this.svc.signup(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto): Promise<SafeUser> {
    return this.svc.login(dto);
  }
}
