import { SetMetadata } from '@nestjs/common';

export const COMPANY_ACCESS_KEY = 'companyAccess';

export enum CompanyAccessLevel {
  OWN_ONLY = 'OWN_ONLY', // Can only access their own company
  ANY = 'ANY', // Can access any company (SUPER_ADMIN)
}

export const CompanyAccess = (level: CompanyAccessLevel) =>
  SetMetadata(COMPANY_ACCESS_KEY, level);
