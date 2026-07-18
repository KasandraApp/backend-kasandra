import { authService } from '../../services/auth';
export const authController = {
    register: async (c) => {
        const payload = await c.req.json();
        const result = await authService.register(payload);
        return c.json(result, result.success ? 201 : 400);
    },
    login: async (c) => {
        const payload = await c.req.json();
        const result = await authService.login(payload);
        return c.json(result, result.success ? 200 : 401);
    },
};
