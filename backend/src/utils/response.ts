import { ApiResponse } from '../types';
import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode = 400) => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
) => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  res.status(200).json(response);
};

export const getPagination = (pageStr?: string, limitStr?: string) => {
  const page = Math.max(1, parseInt(pageStr || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(limitStr || '20')));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};
