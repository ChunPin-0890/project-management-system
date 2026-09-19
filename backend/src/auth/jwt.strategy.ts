// Passport strategy — like configuring JwtBearer options in ASP.NET Core's
// AddAuthentication().AddJwtBearer(). validate() runs after signature/expiry checks pass,
// and its return value becomes request.user (read via @CurrentUser()).
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'change-this-secret-in-production'),
    });
  }

  async validate(payload: JwtPayload) {
    // Intentionally minimal: id + email only. Membership checks are re-verified per-request
    // by ProjectMembersGuard against the DB — we never trust the token's claims for authorization.
    return { userId: payload.sub, email: payload.email };
  }
}
