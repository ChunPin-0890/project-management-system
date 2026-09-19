// Unit test for AuthService — mocks UsersService + bcrypt.compare, like mocking
// UserManager<T> in an ASP.NET Identity unit test.
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  it('returns an access token when credentials are valid', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A', passwordHash: 'hash' }),
    } as any;
    const jwtService = { sign: jest.fn().mockReturnValue('signed-jwt') } as any;
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const service = new AuthService(usersService, jwtService);
    const result = await service.login('a@b.com', 'password123');

    expect(result.accessToken).toBe('signed-jwt');
    expect(result.user.email).toBe('a@b.com');
  });

  it('throws UnauthorizedException for an unknown email', async () => {
    const usersService = { findByEmail: jest.fn().mockResolvedValue(null) } as any;
    const jwtService = { sign: jest.fn() } as any;
    const service = new AuthService(usersService, jwtService);

    await expect(service.login('nope@b.com', 'password123')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the password does not match', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A', passwordHash: 'hash' }),
    } as any;
    const jwtService = { sign: jest.fn() } as any;
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const service = new AuthService(usersService, jwtService);
    await expect(service.login('a@b.com', 'wrong-password')).rejects.toThrow(UnauthorizedException);
  });
});
