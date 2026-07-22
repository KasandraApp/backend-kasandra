import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../../schemas/auth.schema.js';
import { businessRepository, userRepository } from '../../repositories/user.repository.js';
import { signAccessToken } from '../../middleware/auth.middleware.js';
import { ok, fail } from '../../utils/response.js';

export const authService = {
  register: async (input: unknown) => {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid registration payload', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
    }

    const existing = await userRepository.findByEmail(parsed.data.email);
    if (existing) {
      return fail('Email already registered');
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await userRepository.create({
      fullName: parsed.data.full_name,
      email: parsed.data.email,
      passwordHash,
    });

    const businessProfile = await businessRepository.create({
      userId: user.id,
      businessName: parsed.data.business_name,
      businessType: 'general',
      currencyCode: 'IDR',
    });

    const accessToken = signAccessToken({
      userId: String(user.id),
      businessProfileId: String(businessProfile.id),
      email: user.email,
    });

    return ok(
      {
        user: {
          id: user.id,
          full_name: user.fullName,
          email: user.email,
          business_profile: {
            id: businessProfile.id,
            business_name: businessProfile.businessName,
          },
        },
        accessToken,
      },
      'User registered successfully',
    );
  },

  login: async (input: unknown) => {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid login payload');
    }

    const user = await userRepository.findByEmail(parsed.data.email);
    if (!user) {
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

    const profiles = await businessRepository.findByUserId(user.id);
    const businessProfile = profiles[0];
    if (!businessProfile) {
      return fail('No business profile found for user');
    }

    const accessToken = signAccessToken({
      userId: String(user.id),
      businessProfileId: String(businessProfile.id),
      email: user.email,
    });

    return ok(
      {
        user: {
          id: user.id,
          full_name: user.fullName,
          email: user.email,
          business_profile: {
            id: businessProfile.id,
            business_name: businessProfile.businessName,
          },
        },
        accessToken,
      },
      'Login successful',
    );
  },

  me: async (userId: string | number, businessProfileId: string | number) => {
    const user = await userRepository.findById(String(userId));
    const businessProfile = await businessRepository.findById(String(businessProfileId));

    if (!user || !businessProfile || businessProfile.userId !== String(userId)) {
      return fail('User not found');
    }

    return ok({
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      business_profile: {
        id: businessProfile.id,
        business_name: businessProfile.businessName,
        business_type: businessProfile.businessType,
        currency_code: businessProfile.currencyCode,
      },
    });
  },
};
