import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    
    // Log request details
    console.log('=== Incoming Request ===');
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`Authorization Header: ${headers.authorization ? headers.authorization.substring(0, 30) + '...' : 'MISSING'}`);
    console.log(`Content-Type: ${headers['content-type'] || 'N/A'}`);
    
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        console.log(`✅ ${method} ${url} - ${response.statusCode} (${Date.now() - now}ms)`);
      }),
    );
  }
}

