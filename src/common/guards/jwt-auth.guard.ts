import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    console.log('=== JWT Auth Guard Check ===');
    console.log('Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'MISSING');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid Authorization header');
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('❌ JWT Auth Guard failed');
      console.error('Error:', err?.message || 'No error');
      console.error('Info:', info?.message || 'No info');
      console.error('User:', user || 'No user');
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

