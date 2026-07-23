import { Hono } from 'hono';
import { feedbackController } from '../controllers/feedback.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const feedbackRoute = new Hono();

feedbackRoute.post('/', authMiddleware, (c) => feedbackController.submitFeedback(c));

export default feedbackRoute;

