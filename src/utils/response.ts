export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
};

export const ok = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const created = <T>(data: T, message = 'Created'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const fail = (
  message: string,
  errors?: Array<{ field: string; message: string }> | string,
): ApiResponse => ({
  success: false,
  message,
  ...(typeof errors === 'string' ? { error: errors } : errors ? { errors } : {}),
});
