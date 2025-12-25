import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { CurrentUser } from '../../decorator/user.decorator';
import { Public } from '../../decorator/public.decorator';
import type { AuthenticatedUser } from '../../types/auth.type';
import { AUTH_RESPONSE } from '../../constants/api-response/auth.response';
import { SerializeHttpResponse } from '../../utils/serializer';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User signup',
    description:
      'Register a new user with email, password, and profile information. Creates user in both Supabase Auth and database.',
  })
  @ApiResponse({
    status: 201,
    description: 'Signup successful',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or phone already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authService.signup(signupDto);

    return SerializeHttpResponse(
      result,
      HttpStatus.CREATED,
      'Signup successful',
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns user data and session token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    return SerializeHttpResponse(
      result,
      HttpStatus.OK,
      AUTH_RESPONSE.LOGIN_SUCCESS,
    );
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the authenticated user profile information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.authService.getProfile(user);

    return SerializeHttpResponse(
      profile,
      HttpStatus.OK,
      AUTH_RESPONSE.PROFILE_RETRIEVED,
    );
  }
}
