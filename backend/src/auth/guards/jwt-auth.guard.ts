// Guard — like an ASP.NET Core [Authorize] attribute or a React router's auth guard: runs
// before the controller method, rejecting the request (401) if there's no valid JWT.
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
