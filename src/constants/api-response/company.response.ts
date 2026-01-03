export const COMPANY_RESPONSE = {
  // Success messages
  CREATED: 'Company created successfully',
  UPDATED: 'Company updated successfully',
  DELETED: 'Company deleted successfully',
  RETRIEVED: 'Company retrieved successfully',
  LIST_RETRIEVED: 'Companies list retrieved successfully',

  // Error messages
  NOT_FOUND: 'Company not found',
  EMAIL_EXISTS: 'Company with this email already exists',
  UNAUTHORIZED_ACCESS: 'You do not have permission to access this company',
  CANNOT_DELETE_WITH_USERS:
    'Cannot delete company with active users or related data',
} as const;
