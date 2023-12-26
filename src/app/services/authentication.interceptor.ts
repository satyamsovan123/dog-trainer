import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(private commonService: CommonService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (request.url.includes('authentication')) {
      return next.handle(request);
    }

    const token: string = this.commonService.token;

    return next.handle(
      request.clone({
        setHeaders: { Authorization: `Bearer ${token.split(' ')[1]}` },
      })
    );
  }
}
