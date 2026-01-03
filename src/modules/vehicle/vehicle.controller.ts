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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { Roles } from '../../decorator/roles.decorator';
import { USER_ROLES } from '../../constants/user.constant';
import { VEHICLE_RESPONSE } from '../../constants/api-response/vehicle.response';
import {
  SerializeHttpResponse,
  SerializePaginatedResponse,
} from '../../utils/serializer';
import { CurrentUser } from '../../decorator/user.decorator';
import type { AuthenticatedUser } from '../../types/auth.type';

@ApiTags('Vehicles')
@ApiBearerAuth('JWT-auth')
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('create')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vehicle' })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const vehicle = await this.vehicleService.create(createVehicleDto, user);

    return SerializeHttpResponse(
      vehicle,
      HttpStatus.CREATED,
      VEHICLE_RESPONSE.CREATED,
    );
  }

  @Get('list')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all vehicles' })
  async findAll(
    @Query() queryDto: QueryVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.vehicleService.findAll(queryDto, user);

    return SerializePaginatedResponse(
      result.data,
      result.pagination,
      HttpStatus.OK,
      VEHICLE_RESPONSE.LIST_RETRIEVED,
    );
  }

  @Get(':id')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get vehicle by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const vehicle = await this.vehicleService.findOne(id, user);

    return SerializeHttpResponse(
      vehicle,
      HttpStatus.OK,
      VEHICLE_RESPONSE.RETRIEVED,
    );
  }

  @Patch('update/:id')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update vehicle' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const vehicle = await this.vehicleService.update(
      id,
      updateVehicleDto,
      user,
    );

    return SerializeHttpResponse(
      vehicle,
      HttpStatus.OK,
      VEHICLE_RESPONSE.UPDATED,
    );
  }

  @Delete('delete/:id')
  @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete vehicle' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.vehicleService.remove(id, user);

    return SerializeHttpResponse(result, HttpStatus.OK, result.message);
  }
}
