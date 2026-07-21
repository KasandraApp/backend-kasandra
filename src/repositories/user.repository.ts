import { eq } from 'drizzle-orm';
import { db } from '../db';
import { businessProfiles, users } from '../db/schema';

export const userRepository = {
  findByEmail: async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  },

  findByGoogleId: async (googleId: string) => {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return user ?? null;
  },

  findById: async (id: string) => {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  },

  create: async (input: {
    fullName: string;
    email: string;
    passwordHash?: string | null;
    googleId?: string | null;
    authProvider?: 'email' | 'google';
  }) => {
    const [user] = await db
      .insert(users)
      .values({
        fullName: input.fullName,
        email: input.email,
        passwordHash: input.passwordHash ?? null,
        googleId: input.googleId ?? null,
        authProvider: input.authProvider ?? 'email',
      })
      .returning();
    return user;
  },

  update: async (id: string, input: Partial<{ fullName: string; email: string; passwordHash: string | null; googleId: string | null; authProvider: string }>) => {
    const [user] = await db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  },
};

export const businessRepository = {
  findByUserId: async (userId: string) => {
    return await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));
  },

  findById: async (id: string) => {
    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.id, id))
      .limit(1);
    return profile ?? null;
  },

  create: async (input: {
    userId: string;
    businessName: string;
    businessType?: string;
    currencyCode?: string;
  }) => {
    const [profile] = await db
      .insert(businessProfiles)
      .values({
        userId: input.userId,
        businessName: input.businessName,
        businessType: input.businessType ?? 'general',
        currencyCode: input.currencyCode ?? 'IDR',
      })
      .returning();
    return profile;
  },

  update: async (
    id: string,
    input: Partial<{ businessName: string; businessType: string; currencyCode: string }>,
  ) => {
    const [profile] = await db
      .update(businessProfiles)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(businessProfiles.id, id))
      .returning();
    return profile ?? null;
  },

  delete: async (id: string) => {
    const [profile] = await db
      .delete(businessProfiles)
      .where(eq(businessProfiles.id, id))
      .returning();
    return profile ?? null;
  },
};
