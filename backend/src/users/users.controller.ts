// Controller — like an ASP.NET Core Controller class; routes map to methods via decorators
// instead of attribute routing conventions. Used by the frontend to populate assignee pickers.
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  }
}
