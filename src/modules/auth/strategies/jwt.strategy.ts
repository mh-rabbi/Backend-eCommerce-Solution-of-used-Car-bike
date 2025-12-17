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
    
    // CRITICAL FIX: Log JWT secret being used (first few chars only)
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('🔐 JWT Strategy initialized');
    console.log('🔐 Using secret:', secret.substring(0, 10) + '...');
  }

  async validate(payload: any) {
    console.log('=== JWT Validation Started ===');
    console.log('JWT Payload:', JSON.stringify(payload, null, 2));
    console.log('Payload type:', typeof payload);
    console.log('Payload keys:', payload ? Object.keys(payload) : 'null');
    
    // CRITICAL FIX: Check payload structure first
    if (!payload) {
      console.error('❌ Invalid JWT payload: payload is null or undefined');
      throw new UnauthorizedException('Invalid token payload - payload is null');
    }
    
    if (!payload.sub && !payload.userId && !payload.id) {
      console.error('❌ Invalid JWT payload: missing user identifier');
      console.error('Available payload keys:', Object.keys(payload));
      throw new UnauthorizedException('Invalid token payload - missing user identifier');
    }
    
    // CRITICAL FIX: Support multiple payload formats
    const userId = payload.sub || payload.userId || payload.id;

    try {
      console.log(`🔍 Looking up user with ID: ${userId}`);
      const user = await this.usersService.findOne(userId);
      
      if (!user) {
        console.error(`❌ User not found with id: ${userId}`);
        throw new UnauthorizedException('User not found');
      }

      console.log('✅ JWT Validation successful for user:', user.id);
      console.log('User details:', { id: user.id, email: user.email, role: user.role });
      
      // CRITICAL FIX: Return complete user object
      return { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name // Added name for better debugging
      };
    } catch (error) {
      console.error('❌ JWT Validation error:', error.message);
      
      // CRITICAL FIX: Don't throw UnauthorizedException for database errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // For other errors (like DB connection issues), log but allow retry
      console.error('Database or system error during validation:', error);
      throw new UnauthorizedException('Token validation failed - please try again');
    }
  }
}