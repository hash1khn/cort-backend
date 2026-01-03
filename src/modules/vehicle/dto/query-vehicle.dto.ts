import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  VEHICLE_CATEGORY,
  OWNERSHIP_TYPE,
} from '../../../constants/vehicle.constant';
import type {
  VehicleCategory,
  OwnershipType,
} from '../../../constants/vehicle.constant';

export class QueryVehicleDto {
  @ApiProperty({
    description: 'Page number',
    default: 1,
    required: false,
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search by plate number, make, or model',
    required: false,
    example: 'Toyota',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by category',
    enum: VEHICLE_CATEGORY,
    required: false,
  })
  @IsEnum(VEHICLE_CATEGORY)
  @IsOptional()
  category?: VehicleCategory;

  @ApiProperty({
    description: 'Filter by ownership type',
    enum: OWNERSHIP_TYPE,
    required: false,
  })
  @IsEnum(OWNERSHIP_TYPE)
  @IsOptional()
  ownership?: OwnershipType;

  @ApiProperty({
    description:
      'SUPER_ADMIN Only: If true, shows all vehicles including client-owned ones. Default false (shows only Cort fleet)',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  show_all?: boolean = false;
}
