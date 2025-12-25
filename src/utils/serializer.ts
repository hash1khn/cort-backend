import { HttpStatus } from '@nestjs/common';

/**
 * Serialize HTTP response with consistent structure
 */
export function SerializeHttpResponse<T>(
  data: T,
  status: number = HttpStatus.OK,
  message: string = 'Success',
) {
  return {
    data,
    status,
    message,
  };
}

/**
 * Serialize paginated HTTP response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function SerializePaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status: number = HttpStatus.OK,
  message: string = 'Success',
) {
  return {
    data: {
      data,
      pagination,
    },
    status,
    message,
  };
}
