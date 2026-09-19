// Custom param decorator — like a C# model-binder attribute, or React's useContext(AuthContext).
// Pulls the JWT-authenticated user (attached by JwtStrategy) off the request object.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
