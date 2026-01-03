import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import {
  VEHICLE_CATEGORY,
  OWNERSHIP_TYPE,
} from '../../../constants/vehicle.constant';
import type {
  VehicleCategory,
  OwnershipType,
} from '../../../constants/vehicle.constant';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle plate number',
    example: 'ABC-123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Plate number is required' })
  plate_number: string;

  @ApiProperty({
    description: 'Vehicle make/brand',
    example: 'Toyota',
  })
  @IsString()
  @IsNotEmpty({ message: 'Make is required' })
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Corolla',
  })
  @IsString()
  @IsNotEmpty({ message: 'Model is required' })
  model: string;

  @ApiProperty({
    description: 'Vehicle year',
    example: 2022,
  })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @IsNotEmpty({ message: 'Year is required' })
  year: number;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'White',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Vehicle category',
    enum: VEHICLE_CATEGORY,
    example: VEHICLE_CATEGORY.SEDAN,
  })
  @IsEnum(VEHICLE_CATEGORY, {
    message: `Category must be one of: ${Object.values(VEHICLE_CATEGORY).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Category is required' })
  category: VehicleCategory;

  @ApiProperty({
    description: 'Ownership type',
    enum: OWNERSHIP_TYPE,
    example: OWNERSHIP_TYPE.OWNED,
  })
  @IsEnum(OWNERSHIP_TYPE, {
    message: `Ownership must be one of: ${Object.values(OWNERSHIP_TYPE).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Ownership type is required' })
  ownership: OwnershipType;

  @ApiProperty({
    description: 'Fuel average in city (km/l)',
    example: 12.5,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty({ message: 'City fuel average is required' })
  fuel_avg_city: number;

  @ApiProperty({
    description: 'Fuel average on highway (km/l)',
    example: 15.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty({ message: 'Highway fuel average is required' })
  fuel_avg_highway: number;

  @ApiProperty({
    description:
      'Owner Company ID. Note: Super Admins currently cannot assign vehicles to client companies directly to ensure data sovereignty.',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  owner_company_id?: number;

  @ApiProperty({
    description: 'Is vehicle available for pooling/sharing',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_available_for_pooling?: boolean;
}
