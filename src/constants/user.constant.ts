// User roles enum - matches database user_role enum
export enum USER_ROLES {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  DRIVER = 'DRIVER',
}

// Type derived from USER_ROLES enum for type safety
// This ensures type compatibility with Prisma's user_role enum
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// User status - matches database status field (String type)
export enum USER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

// Type derived from USER_STATUS enum for type safety
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// Array of statuses that are not allowed for authentication
export const NOT_ALLOWED_USERS: UserStatus[] = [
  USER_STATUS.INACTIVE,
  USER_STATUS.SUSPENDED,
  USER_STATUS.DELETED,
];
