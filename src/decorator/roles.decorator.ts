import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants/user.constant';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
