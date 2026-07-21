import { eq } from 'drizzle-orm';
import { db } from '../db';
import { businessProfiles, users } from '../db/schema';
import { createId, nowIso, store } from '../utils/in-memory-store';
const fallbackUser = (input) => ({
    id: input.id ?? createId(),
    fullName: input.fullName,
    email: input.email,
    passwordHash: input.passwordHash ?? null,
    googleId: input.googleId ?? null,
    authProvider: input.authProvider === 'google' ? 'google' : 'email',
    createdAt: nowIso(),
    updatedAt: nowIso(),
});
const fallbackBusinessProfile = (input) => ({
    id: input.id ?? createId(),
    userId: input.userId,
    businessName: input.businessName,
    businessType: input.businessType ?? 'general',
    currencyCode: input.currencyCode ?? 'IDR',
    createdAt: nowIso(),
    updatedAt: nowIso(),
});
export const userRepository = {
    findByEmail: async (email) => {
        try {
            const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
            return user ?? null;
        }
        catch {
            return store.users.find((item) => item.email === email) ?? null;
        }
    },
    findByGoogleId: async (googleId) => {
        try {
            const [user] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
            return user ?? null;
        }
        catch {
            return store.users.find((item) => item.googleId === googleId) ?? null;
        }
    },
    findById: async (id) => {
        try {
            const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
            return user ?? null;
        }
        catch {
            return store.users.find((item) => item.id === id) ?? null;
        }
    },
    create: async (input) => {
        try {
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
        }
        catch {
            const user = fallbackUser(input);
            store.users.push(user);
            return user;
        }
    },
    update: async (id, input) => {
        try {
            const [user] = await db
                .update(users)
                .set({ ...input, updatedAt: new Date() })
                .where(eq(users.id, id))
                .returning();
            return user ?? null;
        }
        catch {
            const existing = store.users.find((item) => item.id === id);
            if (!existing) {
                return null;
            }
            const updated = {
                ...existing,
                ...input,
                updatedAt: nowIso(),
            };
            store.users = store.users.map((item) => (item.id === id ? updated : item));
            return updated;
        }
    },
};
export const businessRepository = {
    findByUserId: async (userId) => {
        try {
            return await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));
        }
        catch {
            return store.businessProfiles.filter((item) => item.userId === userId);
        }
    },
    findById: async (id) => {
        try {
            const [profile] = await db
                .select()
                .from(businessProfiles)
                .where(eq(businessProfiles.id, id))
                .limit(1);
            return profile ?? null;
        }
        catch {
            return store.businessProfiles.find((item) => item.id === id) ?? null;
        }
    },
    create: async (input) => {
        try {
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
        }
        catch {
            const profile = fallbackBusinessProfile(input);
            store.businessProfiles.push(profile);
            return profile;
        }
    },
    update: async (id, input) => {
        try {
            const [profile] = await db
                .update(businessProfiles)
                .set({ ...input, updatedAt: new Date() })
                .where(eq(businessProfiles.id, id))
                .returning();
            return profile ?? null;
        }
        catch {
            const existing = store.businessProfiles.find((item) => item.id === id);
            if (!existing) {
                return null;
            }
            const updated = {
                ...existing,
                ...input,
                updatedAt: nowIso(),
            };
            store.businessProfiles = store.businessProfiles.map((item) => (item.id === id ? updated : item));
            return updated;
        }
    },
    delete: async (id) => {
        try {
            const [profile] = await db
                .delete(businessProfiles)
                .where(eq(businessProfiles.id, id))
                .returning();
            return profile ?? null;
        }
        catch {
            const existing = store.businessProfiles.find((item) => item.id === id);
            if (!existing) {
                return null;
            }
            store.businessProfiles = store.businessProfiles.filter((item) => item.id !== id);
            return existing;
        }
    },
};
