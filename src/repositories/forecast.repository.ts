import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { forecastRuns } from '../db/schema.js';

export const forecastRepository = {
  save: async (input: {
    businessProfileId: string;
    forecastType: 'cash' | 'inventory';
    sourceSnapshotJson: Record<string, unknown>;
    resultJson: Record<string, unknown>;
    horizonDays: number;
  }) => {
    const [run] = await db.insert(forecastRuns).values(input).returning();
    return run;
  },

  findLatest: async (businessProfileId: string) => {
    const [run] = await db
      .select()
      .from(forecastRuns)
      .where(eq(forecastRuns.businessProfileId, businessProfileId))
      .orderBy(desc(forecastRuns.generatedAt))
      .limit(1);
    return run ?? null;
  },

  findHistory: async (businessProfileId: string, limit = 20) => {
    return db
      .select()
      .from(forecastRuns)
      .where(eq(forecastRuns.businessProfileId, businessProfileId))
      .orderBy(desc(forecastRuns.generatedAt))
      .limit(limit);
  },
};
