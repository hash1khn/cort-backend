import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getSupabaseClient } from '../common/supabase.config';
import { PrismaService } from '../modules/prisma/prisma.service';
import {
  USER_STATUS,
  NOT_ALLOWED_USERS,
  USER_ROLES,
  UserRole,
  UserStatus,
} from '../constants/user.constant';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the token with Supabase
      const { data, error } = await getSupabaseClient().auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get user data from database
      // public_users.id matches auth_users.id (UUID)
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
        throw new UnauthorizedException('User not found in database');
      }

      // Check if user account is allowed
      // status is a String field, cast to UserStatus since values match our enum
      if (
        !userData.status ||
        NOT_ALLOWED_USERS.includes(userData.status as UserStatus)
      ) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Attach user to request
      // email and full_name are required in DB schema, so they should always exist
      // phone is optional, so it can be null
      request.user = {
        id: data.user.id, // Supabase auth ID (same as public_users.id)
        email: userData.email, // Required in schema, always present
        phone: userData.phone, // Optional in schema, can be null
        full_name: userData.full_name, // Required in schema, always present
        role: userData.role as UserRole, // Cast Prisma user_role to UserRole (values match)
        company_id: userData.company_id,
        account_status: userData.status as UserStatus | null, // Cast string to UserStatus (values match)
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
