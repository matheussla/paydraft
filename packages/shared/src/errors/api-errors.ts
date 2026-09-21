export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'MONGO_UNAVAILABLE'
  | 'CHAIN_UNAVAILABLE'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST'
  | 'SERVICE_UNAVAILABLE'
  | 'PAYMENT_IN_FLIGHT'
  | 'PAYMENT_MISMATCH'
  | 'IDEMPOTENT_REPLAY'
  | 'STALE_CHAIN_CONFIG';

export interface IApiError {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  timestamp: string;
}

export interface IValidationErrorDetail {
  field: string;
  message: string;
}

export interface IValidationError extends IApiError {
  code: 'VALIDATION_ERROR';
  details: IValidationErrorDetail[];
}

export interface INotFoundError extends IApiError {
  code: 'NOT_FOUND';
  resource: string;
  resourceId?: string;
}

export interface IConflictError extends IApiError {
  code: 'CONFLICT';
  resource: string;
  conflictReason?: string;
}

export interface IMongoUnavailableError extends IApiError {
  code: 'MONGO_UNAVAILABLE';
}

export interface IChainUnavailableError extends IApiError {
  code: 'CHAIN_UNAVAILABLE';
}

export const createApiError = (
  code: ApiErrorCode,
  message: string,
  details?: unknown
): IApiError => ({
  code,
  message,
  details,
  timestamp: new Date().toISOString(),
});

export const createValidationError = (
  errors: IValidationErrorDetail[]
): IValidationError => ({
  code: 'VALIDATION_ERROR',
  message: 'Validation failed',
  details: errors,
  timestamp: new Date().toISOString(),
});

export const createNotFoundError = (
  resource: string,
  resourceId?: string
): INotFoundError => ({
  code: 'NOT_FOUND',
  message: `${resource} not found`,
  resource,
  resourceId,
  timestamp: new Date().toISOString(),
});

export const createConflictError = (
  resource: string,
  conflictReason?: string
): IConflictError => ({
  code: 'CONFLICT',
  message: `${resource} conflict`,
  resource,
  conflictReason,
  timestamp: new Date().toISOString(),
});

export const createMongoUnavailableError = (): IMongoUnavailableError => ({
  code: 'MONGO_UNAVAILABLE',
  message: 'Database is unavailable',
  timestamp: new Date().toISOString(),
});

export const createChainUnavailableError = (): IChainUnavailableError => ({
  code: 'CHAIN_UNAVAILABLE',
  message: 'Blockchain network is unavailable',
  timestamp: new Date().toISOString(),
});
