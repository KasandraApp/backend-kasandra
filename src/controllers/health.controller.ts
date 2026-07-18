import { healthService } from '../services/health.service';
import { ok } from '../utils/response';

export const healthController = () => ok(healthService(), 'Kasandra API is healthy');
