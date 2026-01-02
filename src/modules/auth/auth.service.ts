import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    console.log('Login attempt for email:', loginDto.email);
    
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      console.log('User not found with email:', loginDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', loginDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    const token = this.jwtService.sign(payload);
    
    console.log('Login successful for user:', user.id);
    console.log('🔑 Token generated (length:', token.length, ')');
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    console.log('🔐 JWT Secret being used for signing:', secret.substring(0, 10) + '...');
    console.log('🔐 Secret length:', secret.length);
    
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

