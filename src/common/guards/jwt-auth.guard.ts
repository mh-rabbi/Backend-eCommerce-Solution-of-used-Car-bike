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
    
    // CRITICAL FIX: Extract and trim token to prevent signature issues
    const token = authHeader.substring(7).trim(); // Remove "Bearer " prefix
    console.log('🔑 Extracted token length:', token.length);
    console.log('🔑 Token starts with:', token.substring(0, 20) + '...');
    
    // Update the header with trimmed token
    request.headers.authorization = `Bearer ${token}`;
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('❌ JWT Auth Guard failed');
      console.error('Error:', err?.message || 'No error');
      console.error('Error type:', err?.name || 'Unknown');
      console.error('Info:', info?.message || 'No info');
      console.error('Info name:', info?.name || 'Unknown');
      console.error('User:', user || 'No user');
      
      // CRITICAL FIX: Log detailed error information for signature issues
      if (info?.message?.includes('signature') || info?.name === 'JsonWebTokenError') {
        console.error('🔐 JWT Signature Error Detected!');
        console.error('🔐 This usually means the JWT secret used for signing does not match the secret used for verification.');
        console.error('🔐 Please ensure JWT_SECRET environment variable is set correctly and the server is restarted.');
      }
      
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

