import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompanyDto } from './dto/query-company.dto';
import { Roles } from '../../decorator/roles.decorator';
import { USER_ROLES } from '../../constants/user.constant';
import { COMPANY_RESPONSE } from '../../constants/api-response/company.response';
import {
  SerializeHttpResponse,
  SerializePaginatedResponse,
} from '../../utils/serializer';
import { CurrentUser } from '../../decorator/user.decorator';
import type { AuthenticatedUser } from '../../types/auth.type';
import {
  CompanyAccess,
  CompanyAccessLevel,
} from '../../decorator/company-access.decorator';
import { CompanyAccessGuard } from '../../guards/company-access.guard';

@ApiTags('Companies')
@ApiBearerAuth('JWT-auth')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('create')
  @Roles(USER_ROLES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company' })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    const company = await this.companyService.create(createCompanyDto);

    return SerializeHttpResponse(
      company,
      HttpStatus.CREATED,
      COMPANY_RESPONSE.CREATED,
    );
  }

  @Get('list')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get all companies' })
  async findAll(
    @Query() queryDto: QueryCompanyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.companyService.findAll(queryDto, user);

    return SerializePaginatedResponse(
      result.data,
      result.pagination,
      HttpStatus.OK,
      COMPANY_RESPONSE.LIST_RETRIEVED,
    );
  }

  @Get(':id')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN, USER_ROLES.EMPLOYEE)
  @UseGuards(CompanyAccessGuard)
  @CompanyAccess(CompanyAccessLevel.OWN_ONLY)
  @ApiOperation({ summary: 'Get company by ID' })
  async findOne(@Param('id') id: string) {
    const company = await this.companyService.findOne(+id);

    return SerializeHttpResponse(
      company,
      HttpStatus.OK,
      COMPANY_RESPONSE.RETRIEVED,
    );
  }

  @Patch('update/:id')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN)
  @UseGuards(CompanyAccessGuard)
  @CompanyAccess(CompanyAccessLevel.OWN_ONLY)
  @ApiOperation({ summary: 'Update company' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const company = await this.companyService.update(+id, updateCompanyDto);

    return SerializeHttpResponse(
      company,
      HttpStatus.OK,
      COMPANY_RESPONSE.UPDATED,
    );
  }

  @Delete('delete/:id')
  @Roles(USER_ROLES.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete company' })
  async remove(@Param('id') id: string) {
    const result = await this.companyService.remove(+id);

    return SerializeHttpResponse(result, HttpStatus.OK, result.message);
  }
}
