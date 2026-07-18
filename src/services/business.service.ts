import { ok, fail } from '../utils/response';
import { businessRepository } from '../repositories/user.repository';
import {
  createBusinessProfileSchema,
  updateBusinessProfileSchema,
} from '../schemas/business.schema';

export const businessService = {
  list: async (userId: string | number) => {
    const profiles = await businessRepository.findByUserId(String(userId));
    return ok(profiles);
  },

  get: async (id: string | number, userId: string | number) => {
    const profile = await businessRepository.findById(String(id));
    if (!profile || profile.userId !== String(userId)) {
      return fail('Business profile not found');
    }
    return ok(profile);
  },

  create: async (userId: string | number, input: unknown) => {
    const parsed = createBusinessProfileSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid business profile payload');
    }

    const profile = await businessRepository.create({
      userId: String(userId),
      businessName: parsed.data.business_name,
      businessType: parsed.data.business_type,
      currencyCode: parsed.data.currency_code,
    });

    return ok(profile, 'Business profile created');
  },

  update: async (id: string | number, userId: string | number, input: unknown) => {
    const profile = await businessRepository.findById(String(id));
    if (!profile || profile.userId !== String(userId)) {
      return fail('Business profile not found');
    }

    const parsed = updateBusinessProfileSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid update payload');
    }

    const updated = await businessRepository.update(String(id), {
      businessName: parsed.data.business_name,
      businessType: parsed.data.business_type,
      currencyCode: parsed.data.currency_code,
    });

    return ok(updated, 'Business profile updated');
  },

  delete: async (id: string | number, userId: string | number) => {
    const profile = await businessRepository.findById(String(id));
    if (!profile || profile.userId !== String(userId)) {
      return fail('Business profile not found');
    }

    await businessRepository.delete(String(id));
    return ok(null, 'Business profile deleted');
  },
};
