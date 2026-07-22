import { ok, fail } from '../utils/response.js';
import { businessRepository } from '../repositories/user.repository.js';
import { createBusinessProfileSchema, updateBusinessProfileSchema, } from '../schemas/business.schema.js';
export const businessService = {
    list: async (userId) => {
        const profiles = await businessRepository.findByUserId(String(userId));
        return ok(profiles);
    },
    get: async (id, userId) => {
        const profile = await businessRepository.findById(String(id));
        if (!profile || profile.userId !== String(userId)) {
            return fail('Business profile not found');
        }
        return ok(profile);
    },
    create: async (userId, input) => {
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
    update: async (id, userId, input) => {
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
    delete: async (id, userId) => {
        const profile = await businessRepository.findById(String(id));
        if (!profile || profile.userId !== String(userId)) {
            return fail('Business profile not found');
        }
        await businessRepository.delete(String(id));
        return ok(null, 'Business profile deleted');
    },
};
