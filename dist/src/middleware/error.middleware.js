export const errorMiddleware = async (c, next) => {
    try {
        await next();
    }
    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        }, 500);
    }
};
