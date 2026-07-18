export const ok = (data, message = 'Success') => ({
    success: true,
    message,
    data,
});
export const created = (data, message = 'Created') => ({
    success: true,
    message,
    data,
});
export const fail = (message, errors) => ({
    success: false,
    message,
    ...(typeof errors === 'string' ? { error: errors } : errors ? { errors } : {}),
});
