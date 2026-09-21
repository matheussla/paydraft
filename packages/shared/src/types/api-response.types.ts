import { IApiError } from '../errors/api-errors.js';

export interface ApiErrorResponse {
  error: IApiError;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
