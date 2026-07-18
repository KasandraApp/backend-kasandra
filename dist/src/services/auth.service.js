import bcrypt from 'bcryptjs';
import { nowIso } from '../utils/in-memory-store';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { signAccessToken } from '../middleware/auth.middleware';
import { fail, ok } from '../utils/response';
import { businessRepository, userRepository } from '../repositories/user.repository';
const normalize = (value) => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return String(value);
    }
    return '';
};
const normalizeUser = (user) => ({
    id: normalize(user.id),
    fullName: typeof user.fullName === 'string' ? user.fullName : '',
    email: typeof user.email === 'string' ? user.email : '',
    passwordHash: typeof user.passwordHash === 'string' ? user.passwordHash : null,
    googleId: typeof user.googleId === 'string' ? user.googleId : null,
    authProvider: user.authProvider === 'google' ? 'google' : 'email',
    createdAt: typeof user.createdAt === 'string' ? user.createdAt : nowIso(),
    updatedAt: typeof user.updatedAt === 'string' ? user.updatedAt : nowIso(),
});
const normalizeBusinessProfile = (profile) => ({
    id: normalize(profile.id),
    userId: normalize(profile.userId),
    businessName: typeof profile.businessName === 'string' ? profile.businessName : '',
    businessType: typeof profile.businessType === 'string' ? profile.businessType : 'general',
    currencyCode: typeof profile.currencyCode === 'string' ? profile.currencyCode : 'IDR',
    createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : nowIso(),
    updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : nowIso(),
});
const findUserByEmail = async (email) => {
    const user = await userRepository.findByEmail(email);
    return user ? normalizeUser(user) : null;
};
const findUserByGoogleId = async (googleId) => {
    const user = await userRepository.findByGoogleId(googleId);
    return user ? normalizeUser(user) : null;
};
const findUserById = async (userId) => {
    const user = await userRepository.findById(userId);
    return user ? normalizeUser(user) : null;
};
const findBusinessProfileForUser = async (userId) => {
    const profiles = await businessRepository.findByUserId(userId);
    const [profile] = profiles;
    return profile ? normalizeBusinessProfile(profile) : null;
};
const findBusinessProfileById = async (businessProfileId) => {
    const profile = await businessRepository.findById(businessProfileId);
    return profile ? normalizeBusinessProfile(profile) : null;
};
const createUserRecord = async (input) => {
    const user = await userRepository.create({
        fullName: input.fullName,
        email: input.email,
        passwordHash: input.passwordHash ?? null,
        googleId: input.googleId ?? null,
        authProvider: input.authProvider ?? 'email',
    });
    return normalizeUser(user);
};
const createBusinessProfileRecord = async (userId, businessName) => {
    const profile = await businessRepository.create({
        userId,
        businessName,
        businessType: 'general',
        currencyCode: 'IDR',
    });
    return normalizeBusinessProfile(profile);
};
const buildAuthEnvelope = (accessToken, user, businessProfile) => ({
    access_token: accessToken,
    user: { id: user.id, full_name: user.fullName, email: user.email },
    business_profile: { id: businessProfile.id, business_name: businessProfile.businessName },
});
export const authService = {
    register: async (input) => {
        const parsed = registerSchema.safeParse(input);
        if (!parsed.success) {
            return fail('Invalid registration payload', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
        }
        const existing = await findUserByEmail(parsed.data.email);
        if (existing) {
            return fail('Email already registered');
        }
        const passwordHash = await bcrypt.hash(parsed.data.password, 10);
        const user = await createUserRecord({
            fullName: parsed.data.full_name,
            email: parsed.data.email,
            passwordHash,
        });
        const businessProfile = await createBusinessProfileRecord(user.id, parsed.data.business_name);
        const accessToken = signAccessToken({
            userId: normalize(user.id),
            businessProfileId: normalize(businessProfile.id),
            email: user.email,
        });
        return ok(buildAuthEnvelope(accessToken, user, businessProfile), 'Akun berhasil dibuat');
    },
    login: async (input) => {
        const parsed = loginSchema.safeParse(input);
        if (!parsed.success) {
            return fail('Invalid login payload');
        }
        const user = await findUserByEmail(parsed.data.email);
        if (!user || !user.passwordHash) {
            return fail('Invalid credentials');
        }
        const passwordHash = user.passwordHash;
        if (!passwordHash) {
            return fail('Invalid credentials');
        }
        const valid = await bcrypt.compare(parsed.data.password, passwordHash);
        if (!valid) {
            return fail('Invalid credentials');
        }
        const businessProfile = await findBusinessProfileForUser(user.id);
        if (!businessProfile) {
            return fail('No business profile found for user');
        }
        const accessToken = signAccessToken({
            userId: normalize(user.id),
            businessProfileId: normalize(businessProfile.id),
            email: user.email,
        });
        return ok(buildAuthEnvelope(accessToken, user, businessProfile), 'Login berhasil');
    },
    me: async (userId, businessProfileId) => {
        const user = await findUserById(userId);
        const businessProfile = await findBusinessProfileById(businessProfileId);
        if (!user || !businessProfile || businessProfile.userId !== userId) {
            return fail('User not found');
        }
        return ok({
            user: {
                id: user.id,
                full_name: user.fullName,
                email: user.email,
                auth_provider: user.authProvider,
            },
            business_profile: {
                id: businessProfile.id,
                business_name: businessProfile.businessName,
                currency_code: businessProfile.currencyCode,
            },
        });
    },
    googleLogin: async (input) => {
        const existingUser = await findUserByGoogleId(input.googleId);
        if (existingUser) {
            const businessProfile = await findBusinessProfileForUser(existingUser.id);
            const accessToken = signAccessToken({
                userId: normalize(existingUser.id),
                businessProfileId: normalize(businessProfile?.id ?? ''),
                email: existingUser.email,
            });
            return ok({
                access_token: accessToken,
                user: { id: existingUser.id, full_name: existingUser.fullName, email: existingUser.email },
                business_profile: businessProfile ? { id: businessProfile.id, business_name: businessProfile.businessName } : null,
                is_new_user: false,
            }, 'Login dengan Google berhasil');
        }
        const createdUser = await createUserRecord({
            fullName: input.fullName,
            email: input.email,
            googleId: input.googleId,
            authProvider: 'google',
        });
        const businessProfile = await createBusinessProfileRecord(createdUser.id, input.businessName);
        const accessToken = signAccessToken({
            userId: normalize(createdUser.id),
            businessProfileId: normalize(businessProfile.id),
            email: createdUser.email,
        });
        return ok({
            access_token: accessToken,
            user: { id: createdUser.id, full_name: createdUser.fullName, email: createdUser.email },
            business_profile: { id: businessProfile.id, business_name: businessProfile.businessName },
            is_new_user: true,
        }, 'Login dengan Google berhasil');
    },
};
