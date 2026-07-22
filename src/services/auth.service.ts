import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { registerSchema, loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '../schemas/auth.schema.js';
import { signAccessToken } from '../middleware/auth.middleware.js';
import { fail, ok } from '../utils/response.js';
import { businessRepository, userRepository } from '../repositories/user.repository.js';

const nowIso = () => new Date().toISOString();

const normalize = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
};

const normalizeUser = (user: Record<string, unknown>) => ({
  id: normalize(user.id),
  fullName: typeof user.fullName === 'string' ? user.fullName : '',
  email: typeof user.email === 'string' ? user.email : '',
  passwordHash: typeof user.passwordHash === 'string' ? user.passwordHash : null,
  googleId: typeof user.googleId === 'string' ? user.googleId : null,
  authProvider: user.authProvider === 'google' ? 'google' : 'email',
  createdAt: typeof user.createdAt === 'string' ? user.createdAt : nowIso(),
  updatedAt: typeof user.updatedAt === 'string' ? user.updatedAt : nowIso(),
});

const normalizeBusinessProfile = (profile: Record<string, unknown>) => ({
  id: normalize(profile.id),
  userId: normalize(profile.userId),
  businessName: typeof profile.businessName === 'string' ? profile.businessName : '',
  businessType: typeof profile.businessType === 'string' ? profile.businessType : 'general',
  currencyCode: typeof profile.currencyCode === 'string' ? profile.currencyCode : 'IDR',
  createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : nowIso(),
  updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : nowIso(),
});

const findUserByEmail = async (email: string) => {
  const user = await userRepository.findByEmail(email);
  return user ? normalizeUser(user as Record<string, unknown>) : null;
};

const findUserByGoogleId = async (googleId: string) => {
  const user = await userRepository.findByGoogleId(googleId);
  return user ? normalizeUser(user as Record<string, unknown>) : null;
};

const findUserById = async (userId: string) => {
  const user = await userRepository.findById(userId);
  return user ? normalizeUser(user as Record<string, unknown>) : null;
};

const findBusinessProfileForUser = async (userId: string) => {
  const profiles = await businessRepository.findByUserId(userId);
  const [profile] = profiles;
  return profile ? normalizeBusinessProfile(profile as Record<string, unknown>) : null;
};

const findBusinessProfileById = async (businessProfileId: string) => {
  const profile = await businessRepository.findById(businessProfileId);
  return profile ? normalizeBusinessProfile(profile as Record<string, unknown>) : null;
};

const createUserRecord = async (input: { fullName: string; email: string; passwordHash?: string; googleId?: string | null; authProvider?: 'email' | 'google'; }) => {
  const user = await userRepository.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash: input.passwordHash ?? null,
    googleId: input.googleId ?? null,
    authProvider: input.authProvider ?? 'email',
  });
  return normalizeUser(user as Record<string, unknown>);
};

const createBusinessProfileRecord = async (userId: string, businessName: string) => {
  const profile = await businessRepository.create({
    userId,
    businessName,
    businessType: 'general',
    currencyCode: 'IDR',
  });

  return normalizeBusinessProfile(profile as Record<string, unknown>);
};

type PasswordResetRecord = {
  userId: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
};

const passwordResetStore = new Map<string, PasswordResetRecord>();

const createPasswordResetOtp = () => {
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    return '123456';
  }
  return crypto.randomInt(100000, 999999).toString();
};

const getPasswordResetKey = (email: string) => email.trim().toLowerCase();

const sendPasswordResetEmail = async (email: string, otp: string) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: (process.env.SMTP_SECURE ?? 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Kode OTP reset kata sandi Kasandra',
      text: `Kode OTP Anda adalah ${otp}. Kode ini berlaku selama 15 menit.`,
      html: `<p>Kode OTP Anda adalah <strong>${otp}</strong>. Kode ini berlaku selama 15 menit.</p>`,
    });
    return;
  }

  console.info(`[password-reset] OTP ${otp} for ${email}`);
};

const buildAuthEnvelope = (accessToken: string, user: { id: string; fullName: string; email: string }, businessProfile: { id: string; businessName: string }) => ({
  access_token: accessToken,
  user: { id: user.id, full_name: user.fullName, email: user.email },
  business_profile: { id: businessProfile.id, business_name: businessProfile.businessName },
});

export const authService = {
  register: async (input: unknown) => {
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

  login: async (input: unknown) => {
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

  me: async (userId: string, businessProfileId: string) => {
    const user = await findUserById(userId);
    const businessProfile = await findBusinessProfileById(businessProfileId);

    if (!user || !businessProfile || businessProfile.userId !== userId) {
      return fail('User not found');
    }

    return ok({
      namaLengkap: user.fullName,
      namaUsaha: businessProfile.businessName,
      email: user.email,
    });
  },

  updateProfile: async (userId: string, businessProfileId: string, input: unknown) => {
    const data = input as { namaLengkap?: string; namaUsaha?: string; email?: string };

    if (data.namaLengkap || data.email) {
      await userRepository.update(userId, {
        fullName: data.namaLengkap,
        email: data.email,
      });
    }

    if (data.namaUsaha) {
      await businessRepository.update(businessProfileId, {
        businessName: data.namaUsaha,
      });
    }

    const updatedUser = await findUserById(userId);
    const updatedProfile = await findBusinessProfileById(businessProfileId);

    if (!updatedUser || !updatedProfile) {
      return fail('User not found after update');
    }

    return ok({
      namaLengkap: updatedUser.fullName,
      namaUsaha: updatedProfile.businessName,
      email: updatedUser.email,
    }, 'Profil berhasil diperbarui');
  },

  forgotPassword: async (input: unknown) => {
    const parsed = forgotPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid email payload');
    }

    const user = await findUserByEmail(parsed.data.email);
    if (!user) {
      return ok({ email: parsed.data.email, message: 'Jika email terdaftar, kode OTP telah dikirim' }, 'Jika email terdaftar, kode OTP telah dikirim');
    }

    const otp = createPasswordResetOtp();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    passwordResetStore.set(getPasswordResetKey(parsed.data.email), {
      userId: user.id,
      otp,
      expiresAt,
      verified: false,
    });

    await sendPasswordResetEmail(parsed.data.email, otp);

    return ok({
      email: parsed.data.email,
      ...(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? { otp } : {}),
    }, 'Kode OTP berhasil dikirim');
  },

  verifyOtp: async (input: unknown) => {
    const parsed = verifyOtpSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid OTP payload');
    }

    const key = getPasswordResetKey(parsed.data.email);
    const record = passwordResetStore.get(key);
    if (!record) {
      return fail('Kode OTP tidak valid');
    }

    if (Date.now() > record.expiresAt) {
      passwordResetStore.delete(key);
      return fail('Kode OTP sudah kedaluwarsa');
    }

    if (record.otp !== parsed.data.otp) {
      return fail('Kode OTP salah');
    }

    record.verified = true;
    passwordResetStore.set(key, record);

    return ok({ email: parsed.data.email, verified: true }, 'Kode OTP valid');
  },

  resetPassword: async (input: unknown) => {
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid reset payload');
    }

    const key = getPasswordResetKey(parsed.data.email);
    const record = passwordResetStore.get(key);
    if (!record) {
      return fail('Kode OTP tidak valid');
    }

    if (Date.now() > record.expiresAt) {
      passwordResetStore.delete(key);
      return fail('Kode OTP sudah kedaluwarsa');
    }

    if (!record.verified) {
      return fail('Kode OTP belum diverifikasi');
    }

    if (record.otp !== parsed.data.otp) {
      return fail('Kode OTP salah');
    }

    const user = await findUserById(record.userId);
    if (!user) {
      return fail('User tidak ditemukan');
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await userRepository.update(user.id, { passwordHash });
    passwordResetStore.delete(key);

    return ok({ email: parsed.data.email, reset: true }, 'Kata sandi berhasil diubah');
  },

  googleLogin: async (input: { fullName: string; email: string; googleId: string; businessName: string }, options?: { intent?: 'register' | 'login' }) => {
    const intent = options?.intent === 'register' ? 'register' : 'login';
    const existingByGoogleId = await findUserByGoogleId(input.googleId);
    if (existingByGoogleId) {
      const businessProfile = (await findBusinessProfileForUser(existingByGoogleId.id)) ?? await createBusinessProfileRecord(existingByGoogleId.id, input.businessName);
      const accessToken = signAccessToken({
        userId: normalize(existingByGoogleId.id),
        businessProfileId: normalize(businessProfile.id),
        email: existingByGoogleId.email,
      });

      return ok({
        access_token: accessToken,
        user: { id: existingByGoogleId.id, full_name: existingByGoogleId.fullName, email: existingByGoogleId.email },
        business_profile: { id: businessProfile.id, business_name: businessProfile.businessName },
        is_new_user: false,
        requires_business_setup: false,
        next_step: 'dashboard',
      }, 'Login dengan Google berhasil');
    }

    const existingByEmail = await findUserByEmail(input.email);
    if (existingByEmail) {
      if (existingByEmail.googleId && existingByEmail.googleId !== input.googleId) {
        return fail('Email sudah terdaftar dengan provider lain');
      }

      const linkedUser = await userRepository.update(existingByEmail.id, {
        googleId: input.googleId,
        authProvider: 'google',
      });
      const user = linkedUser ? normalizeUser(linkedUser as Record<string, unknown>) : existingByEmail;
      const businessProfile = (await findBusinessProfileForUser(user.id)) ?? await createBusinessProfileRecord(user.id, input.businessName);
      const accessToken = signAccessToken({
        userId: normalize(user.id),
        businessProfileId: normalize(businessProfile.id),
        email: user.email,
      });

      return ok({
        access_token: accessToken,
        user: { id: user.id, full_name: user.fullName, email: user.email },
        business_profile: { id: businessProfile.id, business_name: businessProfile.businessName },
        is_new_user: false,
        requires_business_setup: false,
        next_step: 'dashboard',
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
      requires_business_setup: intent === 'register',
      next_step: intent === 'register' ? 'business_setup' : 'dashboard',
    }, 'Login dengan Google berhasil');
  },
};
