// Service — like a C# scoped service injected via constructor DI, holding data-access logic
// that would otherwise sit in an EF Core repository/DbContext-using service class.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  findAll(): Promise<User[]> {
    return this.usersRepo.find({ order: { name: 'ASC' } });
  }
}
