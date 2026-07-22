import { authService } from '../../services/auth.service.js';

type AuthContext = {
  req: {
    json: () => Promise<unknown>;
  };
  json: (body: unknown, status?: number) => Response;
};

export const authController = {
  register: async (c: AuthContext) => {
    const payload = await c.req.json();
    const result = await authService.register(payload);
    return c.json(result, result.success ? 201 : 400);
  },

  login: async (c: AuthContext) => {
    const payload = await c.req.json();
    const result = await authService.login(payload);
    return c.json(result, result.success ? 200 : 401);
  },
};
