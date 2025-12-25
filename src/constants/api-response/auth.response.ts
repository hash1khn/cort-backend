export const AUTH_RESPONSE = {
  // Success messages
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_RETRIEVED: 'Profile retrieved successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',

  // Error messages
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PHONE_ALREADY_EXISTS: 'Phone number already exists',
  ACCOUNT_SUSPENDED: 'Account has been suspended',
  ACCOUNT_DELETED: 'Account has been deleted',
} as const;
