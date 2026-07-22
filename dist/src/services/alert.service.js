import { fail, ok } from '../utils/response.js';
import { alertRepository } from '../repositories/alert.repository.js';
const normalizeAlert = (alert) => ({
    id: String(alert.id),
    alert_type: alert.alertType ?? alert.alert_type,
    severity: alert.severity,
    message: alert.message,
    detail: alert.detail ?? '',
    status: alert.status,
    trigger_value: alert.triggerValue ?? alert.trigger_value,
    created_at: alert.createdAt ?? alert.created_at,
});
export const alertService = {
    list: async (businessProfileId, query) => {
        try {
            const alerts = await alertRepository.findActive(businessProfileId);
            const normalized = alerts.map((alert) => normalizeAlert(alert));
            if (query?.status) {
                return ok({ alerts: normalized.filter((alert) => alert.status === query.status), total: normalized.length });
            }
            return ok({ alerts: normalized, total: normalized.length });
        }
        catch (error) {
            return fail('Database unavailable while loading alerts', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
    get: async (businessProfileId, id) => {
        try {
            const alert = await alertRepository.findById(id, businessProfileId);
            if (!alert)
                return fail('Alert not found');
            return ok(normalizeAlert(alert));
        }
        catch (error) {
            return fail('Database unavailable while loading the alert', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
    markRead: async (businessProfileId, id) => {
        try {
            const alert = await alertRepository.markRead(id, businessProfileId);
            if (!alert)
                return fail('Alert not found');
            return ok(normalizeAlert(alert), 'Alert marked as read');
        }
        catch (error) {
            return fail('Database unavailable while updating the alert', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
    markResolved: async (businessProfileId, id) => {
        try {
            const alert = await alertRepository.markResolved(id, businessProfileId);
            if (!alert)
                return fail('Alert not found');
            return ok(normalizeAlert(alert), 'Alert marked as resolved');
        }
        catch (error) {
            return fail('Database unavailable while updating the alert', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
};
