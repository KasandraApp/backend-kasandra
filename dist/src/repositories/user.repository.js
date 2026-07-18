import { eq } from 'drizzle-orm';
import { db } from '../db';
import { businessProfiles, users } from '../db/schema';
export const userRepository = {
    findByEmail: async (email) => {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return user ?? null;
    },
    findByGoogleId: async (googleId) => {
        const [user] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
        return user ?? null;
    },
    findById: async (id) => {
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return user ?? null;
    },
    create: async (input) => {
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
    update: async (id, input) => {
        const [user] = await db
            .update(users)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user ?? null;
    },
};
export const businessRepository = {
    findByUserId: async (userId) => {
        return db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));
    },
    findById: async (id) => {
        const [profile] = await db
            .select()
            .from(businessProfiles)
            .where(eq(businessProfiles.id, id))
            .limit(1);
        return profile ?? null;
    },
    create: async (input) => {
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
    update: async (id, input) => {
        const [profile] = await db
            .update(businessProfiles)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(businessProfiles.id, id))
            .returning();
        return profile ?? null;
    },
    delete: async (id) => {
        const [profile] = await db
            .delete(businessProfiles)
            .where(eq(businessProfiles.id, id))
            .returning();
        return profile ?? null;
    },
};
