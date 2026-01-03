import { vehicle_category, ownership_type } from '@prisma/client';

export const VEHICLE_CATEGORY = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  VAN: 'VAN',
  BUS: 'BUS',
  COASTER: 'COASTER',
  HIACE: 'HIACE',
} as const;

export type VehicleCategory =
  (typeof VEHICLE_CATEGORY)[keyof typeof VEHICLE_CATEGORY];

export const OWNERSHIP_TYPE = {
  OWNED: 'OWNED',
  PARTNER: 'PARTNER',
} as const;

export type OwnershipType = (typeof OWNERSHIP_TYPE)[keyof typeof OWNERSHIP_TYPE];

// Type casting for Prisma compatibility if needed, though values match exactly
export const toPrismaVehicleCategory = (
  category: VehicleCategory,
): vehicle_category => category as vehicle_category;

export const toPrismaOwnershipType = (
  type: OwnershipType,
): ownership_type => type as ownership_type;
