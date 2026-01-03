import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompanyDto } from './dto/query-company.dto';
import { COMPANY_RESPONSE } from '../../constants/api-response/company.response';
import { AuthenticatedUser } from '../../types/auth.type';
import { USER_ROLES } from '../../constants/user.constant';
import { PaginationMeta } from '../../utils/serializer';
import { calculatePagination, calculateSkip } from '../../utils/pagination.util';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new company
   */
  async create(createCompanyDto: CreateCompanyDto) {
    // Check if email already exists
    const existingCompany = await this.prisma.companies.findUnique({
      where: { email: createCompanyDto.email },
    });

    if (existingCompany) {
      throw new ConflictException(COMPANY_RESPONSE.EMAIL_EXISTS);
    }

    // Create the company
    const company = await this.prisma.companies.create({
      data: {
        name: createCompanyDto.name,
        email: createCompanyDto.email,
        ntn_number: createCompanyDto.ntn_number ?? null,
        contact_person: createCompanyDto.contact_person ?? null,
        address: createCompanyDto.address ?? null,
        logo_url: createCompanyDto.logo_url ?? null,
        is_shuttle_enabled: createCompanyDto.is_shuttle_enabled ?? false,
        is_chauffeur_enabled: createCompanyDto.is_chauffeur_enabled ?? false,
      },
    });

    return company;
  }

  /**
   * Get all companies with pagination and search
   */
  async findAll(queryDto: QueryCompanyDto, user: AuthenticatedUser) {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = calculateSkip(page, limit);

    // Build where clause
    const where: any = {};

    // COMPANY_ADMIN can only see their own company
    if (user.role === USER_ROLES.COMPANY_ADMIN && user.company_id) {
      where.id = user.company_id;
    }

    // Add search filter if provided
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get total count
    const total = await this.prisma.companies.count({ where });

    // Get paginated data
    const companies = await this.prisma.companies.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total);

    return {
      data: companies,
      pagination,
    };
  }

  /**
   * Get a single company by ID
   */
  async findOne(id: number) {
    const company = await this.prisma.companies.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(COMPANY_RESPONSE.NOT_FOUND);
    }

    return company;
  }

  /**
   * Update a company
   */
  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    // Check if company exists
    const existingCompany = await this.prisma.companies.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new NotFoundException(COMPANY_RESPONSE.NOT_FOUND);
    }

    // If email is being updated, check for uniqueness
    if (updateCompanyDto.email && updateCompanyDto.email !== existingCompany.email) {
      const emailExists = await this.prisma.companies.findUnique({
        where: { email: updateCompanyDto.email },
      });

      if (emailExists) {
        throw new ConflictException(COMPANY_RESPONSE.EMAIL_EXISTS);
      }
    }

    // Update the company
    const company = await this.prisma.companies.update({
      where: { id },
      data: {
        name: updateCompanyDto.name,
        email: updateCompanyDto.email,
        ntn_number: updateCompanyDto.ntn_number ?? undefined,
        contact_person: updateCompanyDto.contact_person ?? undefined,
        address: updateCompanyDto.address ?? undefined,
        logo_url: updateCompanyDto.logo_url ?? undefined,
        is_shuttle_enabled: updateCompanyDto.is_shuttle_enabled ?? undefined,
        is_chauffeur_enabled:
          updateCompanyDto.is_chauffeur_enabled ?? undefined,
      },
    });

    return company;
  }

  /**
   * Delete a company
   */
  async remove(id: number) {
    // Check if company exists
    const company = await this.prisma.companies.findUnique({
      where: { id },
      include: {
        users: true,
        vehicles: true,
        routes: true,
      },
    });

    if (!company) {
      throw new NotFoundException(COMPANY_RESPONSE.NOT_FOUND);
    }

    // Check if company has related data
    if (
      company.users.length > 0 ||
      company.vehicles.length > 0 ||
      company.routes.length > 0
    ) {
      throw new BadRequestException(COMPANY_RESPONSE.CANNOT_DELETE_WITH_USERS);
    }

    // Delete the company
    await this.prisma.companies.delete({
      where: { id },
    });

    return { message: COMPANY_RESPONSE.DELETED };
  }
}
