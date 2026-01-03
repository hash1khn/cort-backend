import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../modules/prisma/prisma.service';
import {
  COMPANY_ACCESS_KEY,
  CompanyAccessLevel,
} from '../decorator/company-access.decorator';
import { AuthenticatedUser } from '../types/auth.type';
import { USER_ROLES } from '../constants/user.constant';
import { COMPANY_RESPONSE } from '../constants/api-response/company.response';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccess = this.reflector.get<CompanyAccessLevel>(
      COMPANY_ACCESS_KEY,
      context.getHandler(),
    );

    if (!requiredAccess) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    const companyId = parseInt(request.params.id);

    // SUPER_ADMIN can access any company
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }

    // For OWN_ONLY access level, check if user's company matches
    if (requiredAccess === CompanyAccessLevel.OWN_ONLY) {
      if (user.company_id !== companyId) {
        throw new ForbiddenException(COMPANY_RESPONSE.UNAUTHORIZED_ACCESS);
      }
      return true;
    }

    return false;
  }
}
