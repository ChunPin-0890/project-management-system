// Request DTO for POST /projects — validated by class-validator, the ValidationPipe-driven
// analogue of Data Annotations + ModelState.
import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  clientName: string;

  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsDateString()
  startDate: string;
}
