import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    
    if (!payload || !payload.sub) {
      console.error('Invalid JWT payload: missing sub');
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        console.error(`User not found with id: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      console.log('JWT Validation successful for user:', user.id);
      return { id: user.id, email: user.email, role: user.role };
    } catch (error) {
      console.error('JWT Validation error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}

