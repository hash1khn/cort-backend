import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  name: string;

  @ApiProperty({
    description: 'Company email address',
    example: 'contact@acme.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'National Tax Number (NTN)',
    example: 'NTN-123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  ntn_number?: string;

  @ApiProperty({
    description: 'Contact person name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  contact_person?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Main Street, Karachi, Pakistan',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logo_url?: string;

  @ApiProperty({
    description: 'Enable shuttle service for this company',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_shuttle_enabled?: boolean;

  @ApiProperty({
    description: 'Enable chauffeur service for this company',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_chauffeur_enabled?: boolean;
}
