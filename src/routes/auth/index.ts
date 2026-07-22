import { Hono } from 'hono';
import { authController } from '../../controllers/auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const authRoute = new Hono();

authRoute.post('/register', (c) => authController.register(c));
authRoute.post('/login', (c) => authController.login(c));
authRoute.get('/google', (c) => authController.google(c));
authRoute.get('/google/callback', (c) => authController.googleCallback(c));
authRoute.post('/logout', authMiddleware, (c) => authController.logout(c));
authRoute.get('/me', authMiddleware, (c) => authController.me(c));
authRoute.put('/update-profile', authMiddleware, (c) => authController.updateProfile(c));
authRoute.post('/forgot-password', (c) => authController.forgotPassword(c));
authRoute.post('/verify-otp', (c) => authController.verifyOtp(c));
authRoute.post('/reset-password', (c) => authController.resetPassword(c));

export default authRoute;
