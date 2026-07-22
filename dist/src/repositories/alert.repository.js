import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { alerts } from '../db/schema.js';
export const alertRepository = {
    findActive: async (businessProfileId) => {
        return db
            .select()
            .from(alerts)
            .where(and(eq(alerts.businessProfileId, businessProfileId), eq(alerts.status, 'active')))
            .orderBy(desc(alerts.createdAt));
    },
    findById: async (id, businessProfileId) => {
        const [alert] = await db
            .select()
            .from(alerts)
            .where(and(eq(alerts.id, id), eq(alerts.businessProfileId, businessProfileId)))
            .limit(1);
        return alert ?? null;
    },
    replaceActive: async (businessProfileId, newAlerts) => {
        await db
            .update(alerts)
            .set({ status: 'resolved', updatedAt: new Date() })
            .where(and(eq(alerts.businessProfileId, businessProfileId), eq(alerts.status, 'active')));
        if (newAlerts.length === 0)
            return [];
        return db
            .insert(alerts)
            .values(newAlerts.map((alert) => ({
            businessProfileId,
            alertType: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            triggerValue: alert.triggerValue,
            status: 'active',
        })))
            .returning();
    },
    markRead: async (id, businessProfileId) => {
        const [alert] = await db
            .update(alerts)
            .set({ status: 'read', updatedAt: new Date() })
            .where(and(eq(alerts.id, id), eq(alerts.businessProfileId, businessProfileId)))
            .returning();
        return alert ?? null;
    },
    markResolved: async (id, businessProfileId) => {
        const [alert] = await db
            .update(alerts)
            .set({ status: 'resolved', updatedAt: new Date() })
            .where(and(eq(alerts.id, id), eq(alerts.businessProfileId, businessProfileId)))
            .returning();
        return alert ?? null;
    },
};
