import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getSupabaseClient } from '../../common/supabase.config';
import { AuthenticatedUser } from '../../types/auth.type';
import {
  USER_STATUS,
  NOT_ALLOWED_USERS,
  UserRole,
  UserStatus,
  USER_ROLES,
} from '../../constants/user.constant';
import { AUTH_RESPONSE } from '../../constants/api-response/auth.response';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Signup new user with Supabase
   */
  async signup(signupDto: SignupDto) {
    const supabase = getSupabaseClient();

    // Check if email already exists in database
    const existingUser = await this.prisma.public_users.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException(AUTH_RESPONSE.EMAIL_ALREADY_EXISTS);
    }

    // Check if phone already exists (if provided)
    if (signupDto.phone) {
      const existingPhone = await this.prisma.public_users.findFirst({
        where: { phone: signupDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException(AUTH_RESPONSE.PHONE_ALREADY_EXISTS);
      }
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: signupDto.email,
      password: signupDto.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new BadRequestException('Failed to create user');
    }

    // Create user in public_users table
    const newUser = await this.prisma.public_users.create({
      data: {
        id: data.user.id, // Use Supabase auth user ID
        email: signupDto.email,
        full_name: signupDto.full_name,
        phone: signupDto.phone ?? null,
        role: USER_ROLES.EMPLOYEE, // Default role
        status: USER_STATUS.ACTIVE, // Default status
      },
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
        company_id: newUser.company_id,
        account_status: newUser.status,
      },
      session: data.session,
    };
  }

  /**
   * Get user profile
   */
  async getProfile(user: AuthenticatedUser) {
    const userData = await this.prisma.public_users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        full_name: true,
        role: true,
        company_id: true,
        status: true,
      },
    });

    if (!userData) {
      throw new UnauthorizedException(AUTH_RESPONSE.USER_NOT_FOUND);
    }

    return {
      id: userData.id,
      email: userData.email,
      phone: userData.phone,
      full_name: userData.full_name,
      role: userData.role,
      company_id: userData.company_id,
      account_status: userData.status,
    };
  }

  /**
   * Login user with Supabase
   * Note: This is a placeholder. Actual login should be handled by Supabase client-side
   * This endpoint can be used for server-side token validation
   */
  async login(email: string, password: string) {
    const supabase = getSupabaseClient();

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new UnauthorizedException(AUTH_RESPONSE.INVALID_CREDENTIALS);
    }

    // Get user data from database
    const userData = await this.prisma.public_users.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        role: true,
        company_id: true,
        status: true,
        full_name: true,
        email: true,
        phone: true,
      },
    });

    if (!userData) {
      throw new UnauthorizedException(AUTH_RESPONSE.USER_NOT_FOUND);
    }

    // Check if user account is allowed
    // Cast status to UserStatus since we know it matches our enum values
    if (
      !userData.status ||
      NOT_ALLOWED_USERS.includes(userData.status as UserStatus)
    ) {
      throw new UnauthorizedException(AUTH_RESPONSE.USER_INACTIVE);
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        phone: userData.phone,
        full_name: userData.full_name,
        role: userData.role,
        company_id: userData.company_id,
        account_status: userData.status,
      },
      session: data.session,
    };
  }

  /**
   * Validate token and return user info
   */
  async validateToken(token: string): Promise<AuthenticatedUser> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException(AUTH_RESPONSE.TOKEN_INVALID);
    }

    const userData = await this.prisma.public_users.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        role: true,
        company_id: true,
        status: true,
        full_name: true,
        email: true,
        phone: true,
      },
    });

    if (!userData) {
      throw new UnauthorizedException(AUTH_RESPONSE.USER_NOT_FOUND);
    }

    if (
      !userData.status ||
      NOT_ALLOWED_USERS.includes(userData.status as UserStatus)
    ) {
      throw new UnauthorizedException(AUTH_RESPONSE.USER_INACTIVE);
    }

    return {
      id: data.user.id, // Supabase auth ID (same as public_users.id)
      email: userData.email, // Required in schema, always present
      phone: userData.phone, // Optional in schema, can be null
      full_name: userData.full_name, // Required in schema, always present
      role: userData.role as UserRole, // Cast Prisma user_role to UserRole (values match)
      company_id: userData.company_id,
      account_status: userData.status as UserStatus | null, // Cast string to UserStatus (values match)
    };
  }
}
