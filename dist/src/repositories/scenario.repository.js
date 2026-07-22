import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { whatIfScenarios } from '../db/schema.js';
export const scenarioRepository = {
    create: async (input) => {
        const [scenario] = await db.insert(whatIfScenarios).values([input]).returning();
        return scenario;
    },
    findAll: async (businessProfileId) => {
        return db
            .select()
            .from(whatIfScenarios)
            .where(eq(whatIfScenarios.businessProfileId, businessProfileId))
            .orderBy(desc(whatIfScenarios.createdAt));
    },
    findById: async (id, businessProfileId) => {
        const [scenario] = await db
            .select()
            .from(whatIfScenarios)
            .where(and(eq(whatIfScenarios.id, id), eq(whatIfScenarios.businessProfileId, businessProfileId)))
            .limit(1);
        return scenario ?? null;
    },
    delete: async (id, businessProfileId) => {
        const [scenario] = await db
            .delete(whatIfScenarios)
            .where(and(eq(whatIfScenarios.id, id), eq(whatIfScenarios.businessProfileId, businessProfileId)))
            .returning();
        return scenario ?? null;
    },
};
