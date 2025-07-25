import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

interface AuthenticatedUser {
  companyId: string;
  [key: string]: any;
}

@Injectable()
export class CompanyAccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user || !user.companyId) {
      return next.handle();
    }

    if (['POST', 'PUT'].includes(request.method)) {
      const body = request.body as { companyId?: string } | undefined;
      if (body && body.companyId && body.companyId !== user.companyId) {
        throw new ForbiddenException(
          'Access denied: You can only create/update data for your own company',
        );
      }
    }

    if (request.method === 'GET' && request.query.companyId) {
      const queryCompanyId = request.query.companyId as string;
      if (queryCompanyId !== user.companyId) {
        throw new ForbiddenException(
          'Access denied: You can only access data from your own company',
        );
      }
    }

    return next.handle();
  }
}
