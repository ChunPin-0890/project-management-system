// DTO — like a C# request model annotated with Data Annotations, validated by the global
// ValidationPipe (class-validator) instead of ASP.NET's ModelState.IsValid.
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
