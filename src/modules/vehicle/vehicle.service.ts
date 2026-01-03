import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { AuthenticatedUser } from '../../types/auth.type';
import { USER_ROLES } from '../../constants/user.constant';
import { VEHICLE_RESPONSE } from '../../constants/api-response/vehicle.response';
import {
  calculatePagination,
  calculateSkip,
} from '../../utils/pagination.util';
import { toPrismaVehicleCategory, toPrismaOwnershipType } from '../../constants/vehicle.constant';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new vehicle
   */
  async create(createVehicleDto: CreateVehicleDto, user: AuthenticatedUser) {
    // Check for duplicate plate number
    const existingVehicle = await this.prisma.vehicles.findUnique({
      where: { plate_number: createVehicleDto.plate_number },
    });

    if (existingVehicle) {
      throw new ConflictException(VEHICLE_RESPONSE.PLATE_EXISTS);
    }

    // Determine owner company ID
    let ownerCompanyId: number | null = null; // Default to null (Super Admin / Cort Fleet)

    if (user.role === USER_ROLES.COMPANY_ADMIN) {
      // COMPANY_ADMIN: Must own the vehicle
      if (!user.company_id) {
        throw new BadRequestException('User does not belong to any company');
      }
      ownerCompanyId = user.company_id;
    } else if (user.role === USER_ROLES.SUPER_ADMIN) {
      // SUPER_ADMIN: Can ONLY create Cort Fleet vehicles (owner_company_id = null)
      // They cannot create "on behalf" of a company to avoid interference
      if (createVehicleDto.owner_company_id) {
        throw new ForbiddenException(
          'Super Admins can only create Cort Managed vehicles (no owner). Client fleets must be managed by the client.',
        );
      }
      ownerCompanyId = null;
    }

    // Create the vehicle
    const vehicle = await this.prisma.vehicles.create({
      data: {
        plate_number: createVehicleDto.plate_number,
        make: createVehicleDto.make,
        model: createVehicleDto.model,
        year: createVehicleDto.year,
        color: createVehicleDto.color,
        category: toPrismaVehicleCategory(createVehicleDto.category),
        ownership: toPrismaOwnershipType(createVehicleDto.ownership),
        fuel_avg_city: createVehicleDto.fuel_avg_city,
        fuel_avg_highway: createVehicleDto.fuel_avg_highway,
        owner_company_id: ownerCompanyId,
        is_available_for_pooling:
          createVehicleDto.is_available_for_pooling ?? false,
      },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return vehicle;
  }

  /**
   * Get all vehicles with pagination and filtering
   */
  async findAll(queryDto: QueryVehicleDto, user: AuthenticatedUser) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      ownership,
      show_all = false,
    } = queryDto;
    const skip = calculateSkip(page, limit);

    const where: any = {};

    // ACCESS CONTROL LOGIC
    if (user.role === USER_ROLES.COMPANY_ADMIN) {
      // Company Admin: STRICTLY see only own vehicles
      if (user.company_id) {
        where.owner_company_id = user.company_id;
      }
    } else if (user.role === USER_ROLES.SUPER_ADMIN) {
      // Super Admin:
      // Default: See ONLY Cort Fleet (owner_company_id = null)
      // If show_all=true: See EVERYTHING (Auditing/Support)
      if (!show_all) {
        where.owner_company_id = null;
      }
    }

    // Search filter (plate, make, model)
    if (search) {
      where.OR = [
        { plate_number: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category) {
      where.category = toPrismaVehicleCategory(category);
    }

    // Ownership filter
    if (ownership) {
      where.ownership = toPrismaOwnershipType(ownership);
    }

    // Get count
    const total = await this.prisma.vehicles.count({ where });

    // Get data
    const vehicles = await this.prisma.vehicles.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'desc' },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const pagination = calculatePagination(page, limit, total);

    return {
      data: vehicles,
      pagination,
    };
  }

  /**
   * Get one vehicle by ID
   */
  async findOne(id: number, user: AuthenticatedUser) {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(VEHICLE_RESPONSE.NOT_FOUND);
    }

    // Access Control: COMPANY_ADMIN can only view their own
    if (
      user.role === USER_ROLES.COMPANY_ADMIN &&
      vehicle.owner_company_id !== user.company_id
    ) {
      throw new ForbiddenException(VEHICLE_RESPONSE.UNAUTHORIZED_ACCESS);
    }

    return vehicle;
  }

  /**
   * Update vehicle
   */
  async update(
    id: number,
    updateVehicleDto: UpdateVehicleDto,
    user: AuthenticatedUser,
  ) {
    // Check if vehicle exists and check permissions
    const existingVehicle = await this.findOne(id, user);

    // SECURITY: Super Admin cannot interfere with Client-Owned vehicles
    if (
      user.role === USER_ROLES.SUPER_ADMIN &&
      existingVehicle.owner_company_id !== null
    ) {
      throw new ForbiddenException(
        'Super Admins cannot modify client-owned vehicles. This data is managed by the client.',
      );
    }

    // If updating plate number, check uniqueness
    if (
      updateVehicleDto.plate_number &&
      updateVehicleDto.plate_number !== existingVehicle.plate_number
    ) {
      const plateExists = await this.prisma.vehicles.findUnique({
        where: { plate_number: updateVehicleDto.plate_number },
      });

      if (plateExists) {
        throw new ConflictException(VEHICLE_RESPONSE.PLATE_EXISTS);
      }
    }

    const updatedVehicle = await this.prisma.vehicles.update({
      where: { id },
      data: {
        plate_number: updateVehicleDto.plate_number,
        make: updateVehicleDto.make,
        model: updateVehicleDto.model,
        year: updateVehicleDto.year,
        color: updateVehicleDto.color,
        category: updateVehicleDto.category
          ? toPrismaVehicleCategory(updateVehicleDto.category)
          : undefined,
        ownership: updateVehicleDto.ownership
          ? toPrismaOwnershipType(updateVehicleDto.ownership)
          : undefined,
        fuel_avg_city: updateVehicleDto.fuel_avg_city,
        fuel_avg_highway: updateVehicleDto.fuel_avg_highway,
        // owner_company_id is IGNORED during update for safety/simplicity
        // We do not allow transferring ownership via update endpoint
        is_available_for_pooling: updateVehicleDto.is_available_for_pooling,
      },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedVehicle;
  }

  /**
   * Delete vehicle
   */
  async remove(id: number, user: AuthenticatedUser) {
    // Check existence and permission
    const vehicle = await this.findOne(id, user);

    // SECURITY: Super Admin cannot interfere with Client-Owned vehicles
    if (
      user.role === USER_ROLES.SUPER_ADMIN &&
      vehicle.owner_company_id !== null
    ) {
      throw new ForbiddenException(
        'Super Admins cannot delete client-owned vehicles. This data is managed by the client.',
      );
    }

    // Check relations before delete
    // We need to check bookings, routes, drivers, and contracts
    const relations = await this.prisma.vehicles.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            chauffeur_bookings: true,
            routes: true,
            drivers_profile: true,
            client_contracts_shuttle: true,
          },
        },
      },
    });

    if (
      (relations?._count?.chauffeur_bookings ?? 0) > 0 ||
      (relations?._count?.routes ?? 0) > 0 ||
      (relations?._count?.drivers_profile ?? 0) > 0 ||
      (relations?._count?.client_contracts_shuttle ?? 0) > 0
    ) {
      throw new BadRequestException(
        VEHICLE_RESPONSE.CANNOT_DELETE_WITH_RELATIONS,
      );
    }

    await this.prisma.vehicles.delete({
      where: { id },
    });

    return { message: VEHICLE_RESPONSE.DELETED };
  }
}
