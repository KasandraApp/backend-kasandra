import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { whatIfScenarios } from '../db/schema.js';

export const scenarioRepository = {
  create: async (input: {
    businessProfileId: string;
    scenarioName: string;
    parameterJson: Record<string, unknown>;
    resultJson: Record<string, unknown>;
  }) => {
    const [scenario] = await db.insert(whatIfScenarios).values([input] as any).returning();
    return scenario;
  },

  findAll: async (businessProfileId: string) => {
    return db
      .select()
      .from(whatIfScenarios)
      .where(eq(whatIfScenarios.businessProfileId, businessProfileId))
      .orderBy(desc(whatIfScenarios.createdAt));
  },

  findById: async (id: string, businessProfileId: string) => {
    const [scenario] = await db
      .select()
      .from(whatIfScenarios)
      .where(
        and(eq(whatIfScenarios.id, id), eq(whatIfScenarios.businessProfileId, businessProfileId)),
      )
      .limit(1);
    return scenario ?? null;
  },

  delete: async (id: string, businessProfileId: string) => {
    const [scenario] = await db
      .delete(whatIfScenarios)
      .where(
        and(eq(whatIfScenarios.id, id), eq(whatIfScenarios.businessProfileId, businessProfileId)),
      )
      .returning();
    return scenario ?? null;
  },
};
