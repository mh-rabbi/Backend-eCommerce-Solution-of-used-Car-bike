import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.id || !user.role) {
      return false;
    }
    
    return user.role === UserRole.ADMIN;
  }
}

