var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/config/env.ts
import dotenv from "dotenv";
var env;
var init_env = __esm({
  "src/config/env.ts"() {
    "use strict";
    dotenv.config();
    env = {
      port: Number(process.env.PORT ?? 3e3),
      nodeEnv: process.env.NODE_ENV ?? "production",
      databaseUrl: process.env.DATABASE_URL ?? "",
      jwtSecret: process.env.JWT_SECRET ?? "",
      redisUrl: process.env.REDIS_URL ?? "",
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
      frontendUrl: process.env.FRONTEND_URL ?? ""
    };
  }
});

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alerts: () => alerts,
  businessProfiles: () => businessProfiles,
  businessProfilesRelations: () => businessProfilesRelations,
  cashTransactions: () => cashTransactions,
  cashTransactionsRelations: () => cashTransactionsRelations,
  exportLogs: () => exportLogs,
  forecastRuns: () => forecastRuns,
  inventoryItems: () => inventoryItems,
  inventoryItemsRelations: () => inventoryItemsRelations,
  inventoryMovements: () => inventoryMovements,
  inventoryMovementsRelations: () => inventoryMovementsRelations,
  schema: () => schema,
  unitEnum: () => unitEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  whatIfScenarios: () => whatIfScenarios
});
import {
  check,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
var unitEnum, users, businessProfiles, cashTransactions, inventoryItems, inventoryMovements, forecastRuns, whatIfScenarios, alerts, exportLogs, usersRelations, businessProfilesRelations, cashTransactionsRelations, inventoryItemsRelations, inventoryMovementsRelations, schema;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    unitEnum = pgEnum("unit_enum", ["kg", "liter", "pcs", "pack"]);
    users = pgTable("users", {
      id: uuid("id").defaultRandom().primaryKey(),
      fullName: varchar("full_name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      passwordHash: text("password_hash"),
      googleId: varchar("google_id", { length: 255 }).unique(),
      authProvider: varchar("auth_provider", { length: 50 }).notNull().default("email"),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    businessProfiles = pgTable("business_profiles", {
      id: uuid("id").defaultRandom().primaryKey(),
      userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      businessName: varchar("business_name", { length: 255 }).notNull(),
      businessType: varchar("business_type", { length: 100 }).notNull().default("general"),
      currencyCode: varchar("currency_code", { length: 10 }).notNull().default("IDR"),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    cashTransactions = pgTable(
      "cash_transactions",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        businessProfileId: uuid("business_profile_id").notNull().references(() => businessProfiles.id, { onDelete: "cascade" }),
        transactionDate: date("transaction_date").notNull(),
        type: varchar("type", { length: 10 }).notNull(),
        category: varchar("category", { length: 100 }).notNull(),
        amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
        note: text("note"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        check("cash_transactions_type_check", sql`${table.type} IN ('income', 'expense')`),
        check("cash_transactions_amount_check", sql`${table.amount} > 0`)
      ]
    );
    inventoryItems = pgTable(
      "inventory_items",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        businessProfileId: uuid("business_profile_id").notNull().references(() => businessProfiles.id, { onDelete: "cascade" }),
        itemName: varchar("item_name", { length: 255 }).notNull(),
        currentStock: numeric("current_stock", { precision: 12, scale: 2 }).notNull().default("0"),
        averageSalesPerDay: numeric("average_sales_per_day", { precision: 10, scale: 2 }).notNull().default("0"),
        unit: unitEnum("unit").notNull().default("pcs"),
        minimumThreshold: numeric("minimum_threshold", { precision: 10, scale: 2 }).default("0"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        check("inventory_items_current_stock_check", sql`${table.currentStock} >= 0`),
        check("inventory_items_average_sales_check", sql`${table.averageSalesPerDay} >= 0`)
      ]
    );
    inventoryMovements = pgTable(
      "inventory_movements",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        inventoryItemId: uuid("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
        movementDate: date("movement_date").notNull(),
        movementType: varchar("movement_type", { length: 20 }).notNull(),
        quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
        note: text("note"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        check(
          "inventory_movements_type_check",
          sql`${table.movementType} IN ('in', 'out', 'adjustment')`
        ),
        check("inventory_movements_quantity_check", sql`${table.quantity} > 0`)
      ]
    );
    forecastRuns = pgTable(
      "forecast_runs",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        businessProfileId: uuid("business_profile_id").notNull().references(() => businessProfiles.id, { onDelete: "cascade" }),
        forecastType: varchar("forecast_type", { length: 20 }).notNull(),
        sourceSnapshotJson: jsonb("source_snapshot_json").notNull(),
        resultJson: jsonb("result_json").notNull(),
        horizonDays: integer("horizon_days").notNull().default(30),
        generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        check("forecast_runs_type_check", sql`${table.forecastType} IN ('cash', 'inventory', 'combined')`),
        check("forecast_runs_horizon_check", sql`${table.horizonDays} > 0`)
      ]
    );
    whatIfScenarios = pgTable("what_if_scenarios", {
      id: uuid("id").defaultRandom().primaryKey(),
      businessProfileId: uuid("business_profile_id").notNull().references(() => businessProfiles.id, { onDelete: "cascade" }),
      scenarioName: varchar("scenario_name", { length: 255 }).notNull(),
      parameterJson: jsonb("parameter_json").notNull(),
      resultJson: jsonb("result_json").notNull(),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    alerts = pgTable(
      "alerts",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        businessProfileId: uuid("business_profile_id").notNull().references(() => businessProfiles.id, { onDelete: "cascade" }),
        alertType: varchar("alert_type", { length: 20 }).notNull(),
        severity: varchar("severity", { length: 20 }).notNull(),
        message: text("message").notNull(),
        detail: text("detail"),
        status: varchar("status", { length: 20 }).notNull().default("active"),
        triggerValue: numeric("trigger_value", { precision: 15, scale: 2 }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        check("alerts_type_check", sql`${table.alertType} IN ('cash', 'inventory')`),
        check("alerts_severity_check", sql`${table.severity} IN ('info', 'warning', 'critical')`),
        check("alerts_status_check", sql`${table.status} IN ('active', 'read', 'resolved')`)
      ]
    );
    exportLogs = pgTable(
      "export_logs",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        businessProfileId: uuid("business_profile_id").notNull().references(() => businessProfiles.id, { onDelete: "cascade" }),
        exportType: varchar("export_type", { length: 10 }).notNull(),
        filePath: text("file_path").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [check("export_logs_type_check", sql`${table.exportType} IN ('pdf', 'excel')`)]
    );
    usersRelations = relations(users, ({ many }) => ({
      businessProfiles: many(businessProfiles)
    }));
    businessProfilesRelations = relations(businessProfiles, ({ one, many }) => ({
      user: one(users, { fields: [businessProfiles.userId], references: [users.id] }),
      cashTransactions: many(cashTransactions),
      inventoryItems: many(inventoryItems),
      forecastRuns: many(forecastRuns),
      whatIfScenarios: many(whatIfScenarios),
      alerts: many(alerts),
      exportLogs: many(exportLogs)
    }));
    cashTransactionsRelations = relations(cashTransactions, ({ one }) => ({
      businessProfile: one(businessProfiles, {
        fields: [cashTransactions.businessProfileId],
        references: [businessProfiles.id]
      })
    }));
    inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
      businessProfile: one(businessProfiles, {
        fields: [inventoryItems.businessProfileId],
        references: [businessProfiles.id]
      }),
      movements: many(inventoryMovements)
    }));
    inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
      inventoryItem: one(inventoryItems, {
        fields: [inventoryMovements.inventoryItemId],
        references: [inventoryItems.id]
      })
    }));
    schema = {
      users,
      businessProfiles,
      cashTransactions,
      inventoryItems,
      inventoryMovements,
      forecastRuns,
      whatIfScenarios,
      alerts,
      exportLogs
    };
  }
});

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  schema: () => schema_exports
});
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var queryClient, db;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    init_env();
    init_schema();
    queryClient = postgres(env.databaseUrl);
    db = drizzle(queryClient, { schema: schema_exports });
  }
});

// src/vercel-handler.ts
import { handle } from "hono/vercel";

// src/app.ts
import { Hono as Hono8 } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

// src/middleware/logger.middleware.ts
var loggerMiddleware = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${c.req.method} ${c.req.path} -> ${c.res.status} (${duration}ms)`);
};

// src/middleware/error.middleware.ts
var errorMiddleware = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      },
      500
    );
  }
};

// src/config/constants.ts
var API_PREFIX = "/api/v1";
var DEFAULT_HORIZON_DAYS = 30;
var ALERT_THRESHOLDS = {
  inventoryCriticalDays: 3,
  cashCriticalDays: 7
};

// src/routes/health.route.ts
import { Hono } from "hono";

// src/repositories/health.repository.ts
var healthRepository = () => ({
  status: "ok",
  service: "kasandra-api"
});

// src/services/health.service.ts
var healthService = () => healthRepository();

// src/utils/response.ts
var ok = (data, message = "Success") => ({
  success: true,
  message,
  data
});
var created = (data, message = "Created") => ({
  success: true,
  message,
  data
});
var fail = (message, errors) => ({
  success: false,
  message,
  ...typeof errors === "string" ? { error: errors } : errors ? { errors } : {}
});

// src/controllers/health.controller.ts
var healthController = () => ok(healthService(), "Kasandra API is healthy");

// src/routes/health.route.ts
var healthRoute = new Hono();
healthRoute.get("/", (c) => c.json(healthController()));
var health_route_default = healthRoute;

// src/routes/auth/index.ts
import { Hono as Hono2 } from "hono";

// src/controllers/auth.controller.ts
init_env();

// src/services/auth.service.ts
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// src/schemas/auth.schema.ts
import { z } from "zod";
var registerInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  kataSandi: z.string().min(8).optional(),
  full_name: z.string().trim().min(2).optional(),
  fullName: z.string().trim().min(2).optional(),
  name: z.string().trim().min(2).optional(),
  namaLengkap: z.string().trim().min(2).optional(),
  business_name: z.string().trim().min(2).optional(),
  businessName: z.string().trim().min(2).optional(),
  namaUsaha: z.string().trim().min(2).optional()
}).superRefine((value, ctx) => {
  const fullName = value.full_name ?? value.fullName ?? value.name ?? value.namaLengkap;
  const businessName = value.business_name ?? value.businessName ?? value.namaUsaha ?? fullName;
  const password = value.password ?? value.kataSandi;
  if (!password) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "password or kataSandi is required" });
  }
  if (!fullName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["full_name"], message: "full_name or namaLengkap is required" });
  }
  if (!businessName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["business_name"], message: "business_name or namaUsaha is required" });
  }
});
var registerSchema = registerInputSchema.transform((value) => ({
  full_name: value.full_name ?? value.fullName ?? value.name ?? value.namaLengkap ?? "",
  business_name: value.business_name ?? value.businessName ?? value.namaUsaha ?? (value.full_name ?? value.fullName ?? value.name ?? value.namaLengkap ?? ""),
  email: value.email,
  password: value.password ?? value.kataSandi ?? ""
}));
var loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  kataSandi: z.string().min(8).optional()
}).superRefine((value, ctx) => {
  if (!value.password && !value.kataSandi) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "password or kataSandi is required" });
  }
}).transform((value) => ({
  email: value.email,
  password: value.password ?? value.kataSandi ?? ""
}));
var updateProfileSchema = z.object({
  namaLengkap: z.string().trim().min(2).optional(),
  namaUsaha: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional()
});
var forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});
var verifyOtpSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().regex(/^\d{6}$/)
});
var resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().regex(/^\d{6}$/),
  password: z.string().min(8).optional(),
  kataSandi: z.string().min(8).optional()
}).superRefine((value, ctx) => {
  if (!value.password && !value.kataSandi) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "password or kataSandi is required" });
  }
}).transform((value) => ({
  email: value.email,
  otp: value.otp,
  password: value.password ?? value.kataSandi ?? ""
}));

// src/middleware/auth.middleware.ts
init_env();
import jwt from "jsonwebtoken";
function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}
function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
var authMiddleware = async (c, next) => {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    c.set("auth", payload);
    await next();
  } catch {
    return c.json({ success: false, message: "Invalid or expired token" }, 401);
  }
};

// src/repositories/user.repository.ts
init_db();
init_schema();
import { eq } from "drizzle-orm";
var userRepository = {
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
    const [user] = await db.insert(users).values({
      fullName: input.fullName,
      email: input.email,
      passwordHash: input.passwordHash ?? null,
      googleId: input.googleId ?? null,
      authProvider: input.authProvider ?? "email"
    }).returning();
    return user;
  },
  update: async (id, input) => {
    const [user] = await db.update(users).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user ?? null;
  }
};
var businessRepository = {
  findByUserId: async (userId) => {
    return await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));
  },
  findById: async (id) => {
    const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.id, id)).limit(1);
    return profile ?? null;
  },
  create: async (input) => {
    const [profile] = await db.insert(businessProfiles).values({
      userId: input.userId,
      businessName: input.businessName,
      businessType: input.businessType ?? "general",
      currencyCode: input.currencyCode ?? "IDR"
    }).returning();
    return profile;
  },
  update: async (id, input) => {
    const [profile] = await db.update(businessProfiles).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(eq(businessProfiles.id, id)).returning();
    return profile ?? null;
  },
  delete: async (id) => {
    const [profile] = await db.delete(businessProfiles).where(eq(businessProfiles.id, id)).returning();
    return profile ?? null;
  }
};

// src/services/auth.service.ts
var nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
var normalize = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
};
var normalizeUser = (user) => ({
  id: normalize(user.id),
  fullName: typeof user.fullName === "string" ? user.fullName : "",
  email: typeof user.email === "string" ? user.email : "",
  passwordHash: typeof user.passwordHash === "string" ? user.passwordHash : null,
  googleId: typeof user.googleId === "string" ? user.googleId : null,
  authProvider: user.authProvider === "google" ? "google" : "email",
  createdAt: typeof user.createdAt === "string" ? user.createdAt : nowIso(),
  updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : nowIso()
});
var normalizeBusinessProfile = (profile) => ({
  id: normalize(profile.id),
  userId: normalize(profile.userId),
  businessName: typeof profile.businessName === "string" ? profile.businessName : "",
  businessType: typeof profile.businessType === "string" ? profile.businessType : "general",
  currencyCode: typeof profile.currencyCode === "string" ? profile.currencyCode : "IDR",
  createdAt: typeof profile.createdAt === "string" ? profile.createdAt : nowIso(),
  updatedAt: typeof profile.updatedAt === "string" ? profile.updatedAt : nowIso()
});
var findUserByEmail = async (email) => {
  const user = await userRepository.findByEmail(email);
  return user ? normalizeUser(user) : null;
};
var findUserByGoogleId = async (googleId) => {
  const user = await userRepository.findByGoogleId(googleId);
  return user ? normalizeUser(user) : null;
};
var findUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  return user ? normalizeUser(user) : null;
};
var findBusinessProfileForUser = async (userId) => {
  const profiles = await businessRepository.findByUserId(userId);
  const [profile] = profiles;
  return profile ? normalizeBusinessProfile(profile) : null;
};
var findBusinessProfileById = async (businessProfileId) => {
  const profile = await businessRepository.findById(businessProfileId);
  return profile ? normalizeBusinessProfile(profile) : null;
};
var createUserRecord = async (input) => {
  const user = await userRepository.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash: input.passwordHash ?? null,
    googleId: input.googleId ?? null,
    authProvider: input.authProvider ?? "email"
  });
  return normalizeUser(user);
};
var createBusinessProfileRecord = async (userId, businessName) => {
  const profile = await businessRepository.create({
    userId,
    businessName,
    businessType: "general",
    currencyCode: "IDR"
  });
  return normalizeBusinessProfile(profile);
};
var passwordResetStore = /* @__PURE__ */ new Map();
var createPasswordResetOtp = () => {
  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
    return "123456";
  }
  return crypto.randomInt(1e5, 999999).toString();
};
var getPasswordResetKey = (email) => email.trim().toLowerCase();
var sendPasswordResetEmail = async (email, otp) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: (process.env.SMTP_SECURE ?? "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Kode OTP reset kata sandi Kasandra",
      text: `Kode OTP Anda adalah ${otp}. Kode ini berlaku selama 15 menit.`,
      html: `<p>Kode OTP Anda adalah <strong>${otp}</strong>. Kode ini berlaku selama 15 menit.</p>`
    });
    return;
  }
  console.info(`[password-reset] OTP ${otp} for ${email}`);
};
var buildAuthEnvelope = (accessToken, user, businessProfile) => ({
  access_token: accessToken,
  user: { id: user.id, full_name: user.fullName, email: user.email },
  business_profile: { id: businessProfile.id, business_name: businessProfile.businessName }
});
var authService = {
  register: async (input) => {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid registration payload", parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })));
    }
    const existing = await findUserByEmail(parsed.data.email);
    if (existing) {
      return fail("Email already registered");
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await createUserRecord({
      fullName: parsed.data.full_name,
      email: parsed.data.email,
      passwordHash
    });
    const businessProfile = await createBusinessProfileRecord(user.id, parsed.data.business_name);
    const accessToken = signAccessToken({
      userId: normalize(user.id),
      businessProfileId: normalize(businessProfile.id),
      email: user.email
    });
    return ok(buildAuthEnvelope(accessToken, user, businessProfile), "Akun berhasil dibuat");
  },
  login: async (input) => {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid login payload");
    }
    const user = await findUserByEmail(parsed.data.email);
    if (!user || !user.passwordHash) {
      return fail("Invalid credentials");
    }
    const passwordHash = user.passwordHash;
    if (!passwordHash) {
      return fail("Invalid credentials");
    }
    const valid = await bcrypt.compare(parsed.data.password, passwordHash);
    if (!valid) {
      return fail("Invalid credentials");
    }
    const businessProfile = await findBusinessProfileForUser(user.id);
    if (!businessProfile) {
      return fail("No business profile found for user");
    }
    const accessToken = signAccessToken({
      userId: normalize(user.id),
      businessProfileId: normalize(businessProfile.id),
      email: user.email
    });
    return ok(buildAuthEnvelope(accessToken, user, businessProfile), "Login berhasil");
  },
  me: async (userId, businessProfileId) => {
    const user = await findUserById(userId);
    const businessProfile = await findBusinessProfileById(businessProfileId);
    if (!user || !businessProfile || businessProfile.userId !== userId) {
      return fail("User not found");
    }
    return ok({
      namaLengkap: user.fullName,
      namaUsaha: businessProfile.businessName,
      email: user.email
    });
  },
  updateProfile: async (userId, businessProfileId, input) => {
    const data = input;
    if (data.namaLengkap || data.email) {
      await userRepository.update(userId, {
        fullName: data.namaLengkap,
        email: data.email
      });
    }
    if (data.namaUsaha) {
      await businessRepository.update(businessProfileId, {
        businessName: data.namaUsaha
      });
    }
    const updatedUser = await findUserById(userId);
    const updatedProfile = await findBusinessProfileById(businessProfileId);
    if (!updatedUser || !updatedProfile) {
      return fail("User not found after update");
    }
    return ok({
      namaLengkap: updatedUser.fullName,
      namaUsaha: updatedProfile.businessName,
      email: updatedUser.email
    }, "Profil berhasil diperbarui");
  },
  forgotPassword: async (input) => {
    const parsed = forgotPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid email payload");
    }
    const user = await findUserByEmail(parsed.data.email);
    if (!user) {
      return ok({ email: parsed.data.email, message: "Jika email terdaftar, kode OTP telah dikirim" }, "Jika email terdaftar, kode OTP telah dikirim");
    }
    const otp = createPasswordResetOtp();
    const expiresAt = Date.now() + 15 * 60 * 1e3;
    passwordResetStore.set(getPasswordResetKey(parsed.data.email), {
      userId: user.id,
      otp,
      expiresAt,
      verified: false
    });
    await sendPasswordResetEmail(parsed.data.email, otp);
    return ok({
      email: parsed.data.email,
      ...process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development" ? { otp } : {}
    }, "Kode OTP berhasil dikirim");
  },
  verifyOtp: async (input) => {
    const parsed = verifyOtpSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid OTP payload");
    }
    const key = getPasswordResetKey(parsed.data.email);
    const record = passwordResetStore.get(key);
    if (!record) {
      return fail("Kode OTP tidak valid");
    }
    if (Date.now() > record.expiresAt) {
      passwordResetStore.delete(key);
      return fail("Kode OTP sudah kedaluwarsa");
    }
    if (record.otp !== parsed.data.otp) {
      return fail("Kode OTP salah");
    }
    record.verified = true;
    passwordResetStore.set(key, record);
    return ok({ email: parsed.data.email, verified: true }, "Kode OTP valid");
  },
  resetPassword: async (input) => {
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid reset payload");
    }
    const key = getPasswordResetKey(parsed.data.email);
    const record = passwordResetStore.get(key);
    if (!record) {
      return fail("Kode OTP tidak valid");
    }
    if (Date.now() > record.expiresAt) {
      passwordResetStore.delete(key);
      return fail("Kode OTP sudah kedaluwarsa");
    }
    if (!record.verified) {
      return fail("Kode OTP belum diverifikasi");
    }
    if (record.otp !== parsed.data.otp) {
      return fail("Kode OTP salah");
    }
    const user = await findUserById(record.userId);
    if (!user) {
      return fail("User tidak ditemukan");
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await userRepository.update(user.id, { passwordHash });
    passwordResetStore.delete(key);
    return ok({ email: parsed.data.email, reset: true }, "Kata sandi berhasil diubah");
  },
  googleLogin: async (input, options) => {
    const intent = options?.intent === "register" ? "register" : "login";
    const existingByGoogleId = await findUserByGoogleId(input.googleId);
    if (existingByGoogleId) {
      const businessProfile2 = await findBusinessProfileForUser(existingByGoogleId.id) ?? await createBusinessProfileRecord(existingByGoogleId.id, input.businessName);
      const accessToken2 = signAccessToken({
        userId: normalize(existingByGoogleId.id),
        businessProfileId: normalize(businessProfile2.id),
        email: existingByGoogleId.email
      });
      return ok({
        access_token: accessToken2,
        user: { id: existingByGoogleId.id, full_name: existingByGoogleId.fullName, email: existingByGoogleId.email },
        business_profile: { id: businessProfile2.id, business_name: businessProfile2.businessName },
        is_new_user: false,
        requires_business_setup: false,
        next_step: "dashboard"
      }, "Login dengan Google berhasil");
    }
    const existingByEmail = await findUserByEmail(input.email);
    if (existingByEmail) {
      if (existingByEmail.googleId && existingByEmail.googleId !== input.googleId) {
        return fail("Email sudah terdaftar dengan provider lain");
      }
      const linkedUser = await userRepository.update(existingByEmail.id, {
        googleId: input.googleId,
        authProvider: "google"
      });
      const user = linkedUser ? normalizeUser(linkedUser) : existingByEmail;
      const businessProfile2 = await findBusinessProfileForUser(user.id) ?? await createBusinessProfileRecord(user.id, input.businessName);
      const accessToken2 = signAccessToken({
        userId: normalize(user.id),
        businessProfileId: normalize(businessProfile2.id),
        email: user.email
      });
      return ok({
        access_token: accessToken2,
        user: { id: user.id, full_name: user.fullName, email: user.email },
        business_profile: { id: businessProfile2.id, business_name: businessProfile2.businessName },
        is_new_user: false,
        requires_business_setup: false,
        next_step: "dashboard"
      }, "Login dengan Google berhasil");
    }
    const createdUser = await createUserRecord({
      fullName: input.fullName,
      email: input.email,
      googleId: input.googleId,
      authProvider: "google"
    });
    const businessProfile = await createBusinessProfileRecord(createdUser.id, input.businessName);
    const accessToken = signAccessToken({
      userId: normalize(createdUser.id),
      businessProfileId: normalize(businessProfile.id),
      email: createdUser.email
    });
    return ok({
      access_token: accessToken,
      user: { id: createdUser.id, full_name: createdUser.fullName, email: createdUser.email },
      business_profile: { id: businessProfile.id, business_name: businessProfile.businessName },
      is_new_user: true,
      requires_business_setup: intent === "register",
      next_step: intent === "register" ? "business_setup" : "dashboard"
    }, "Login dengan Google berhasil");
  }
};

// src/services/oauth.service.ts
init_env();
var oauthService = {
  buildAuthUrl: (redirectUri, clientId, state) => {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "offline");
    if (state) {
      url.searchParams.set("state", state);
    }
    return url.toString();
  },
  exchangeCode: async (code, redirectUri) => {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    if (!response.ok) {
      throw new Error("Failed to exchange Google authorization code");
    }
    return response.json();
  },
  fetchUserInfo: async (accessToken) => {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch Google user profile");
    }
    return response.json();
  }
};

// src/controllers/auth.controller.ts
var authController = {
  register: async (c) => {
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.register(payload);
    if (result.success) {
      return c.json(result, 201);
    }
    return c.json(result, 400);
  },
  login: async (c) => {
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.login(payload);
    if (result.success) {
      return c.json(result, 200);
    }
    return c.json(result, 401);
  },
  logout: async (c) => {
    return c.json({ success: true, message: "Logout berhasil" });
  },
  me: async (c) => {
    const auth = c.get("auth");
    const result = await authService.me(auth.userId, auth.businessProfileId);
    if (result.success) {
      return c.json(result, 200);
    }
    return c.json(result, 404);
  },
  updateProfile: async (c) => {
    const auth = c.get("auth");
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.updateProfile(auth.userId, auth.businessProfileId, payload);
    if (result.success) {
      return c.json(result, 200);
    }
    return c.json(result, 400);
  },
  forgotPassword: async (c) => {
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.forgotPassword(payload);
    if (result.success) {
      return c.json(result, 200);
    }
    return c.json(result, 400);
  },
  verifyOtp: async (c) => {
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.verifyOtp(payload);
    if (result.success) {
      return c.json(result, 200);
    }
    return c.json(result, 400);
  },
  resetPassword: async (c) => {
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.resetPassword(payload);
    if (result.success) {
      return c.json(result, 200);
    }
    return c.json(result, 400);
  },
  google: async (c) => {
    const intent = c.req.query("intent") === "register" ? "register" : "login";
    if (!env.googleClientId || !env.googleClientSecret) {
      return c.json({
        success: false,
        message: "Google OAuth belum dikonfigurasi. Silakan isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di file .env",
        hint: "Buka https://console.cloud.google.com/apis/credentials, buat OAuth 2.0 Client ID, lalu isi di .env"
      }, 501);
    }
    const redirectUri = env.googleRedirectUri || `${c.req.header("x-forwarded-proto") ?? "http"}://${c.req.header("host") ?? "localhost"}/api/v1/auth/google/callback`;
    const url = oauthService.buildAuthUrl(redirectUri, env.googleClientId, intent);
    return c.redirect(url);
  },
  googleCallback: async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const intent = state === "register" ? "register" : "login";
    if (!code) {
      return c.json({ success: false, message: "Missing Google OAuth code" }, 400);
    }
    if (!env.googleClientId || !env.googleClientSecret) {
      return c.json({ success: false, message: "Google OAuth is not configured" }, 500);
    }
    try {
      const redirectUri = env.googleRedirectUri || `${c.req.header("x-forwarded-proto") ?? "http"}://${c.req.header("host") ?? "localhost"}/api/v1/auth/google/callback`;
      const tokenPayload = await oauthService.exchangeCode(code, redirectUri);
      const accessToken = tokenPayload.access_token;
      if (!accessToken) {
        return c.json({ success: false, message: "Failed to exchange Google code" }, 400);
      }
      const userInfo = await oauthService.fetchUserInfo(accessToken);
      const email = userInfo.email;
      const googleId = userInfo.id;
      const fullName = userInfo.name ?? email ?? "Google User";
      if (!email || !googleId) {
        return c.json({ success: false, message: "Unable to read Google profile" }, 400);
      }
      const result = await authService.googleLogin({
        fullName,
        email,
        googleId,
        businessName: `${fullName}'s Business`
      }, { intent });
      const responseData = result.data;
      if (result.success && responseData?.access_token) {
        const redirectPath = intent === "register" && responseData.requires_business_setup ? "/oauth/google/setup" : "/";
        return c.redirect(`${env.frontendUrl}${redirectPath}?token=${responseData.access_token}&mode=${intent}`);
      }
      return c.json(result, result.success ? 200 : 400);
    } catch {
      return c.json({ success: false, message: "Google OAuth failed" }, 500);
    }
  }
};

// src/routes/auth/index.ts
var authRoute = new Hono2();
authRoute.post("/register", (c) => authController.register(c));
authRoute.post("/login", (c) => authController.login(c));
authRoute.get("/google", (c) => authController.google(c));
authRoute.get("/google/callback", (c) => authController.googleCallback(c));
authRoute.post("/logout", authMiddleware, (c) => authController.logout(c));
authRoute.get("/me", authMiddleware, (c) => authController.me(c));
authRoute.put("/update-profile", authMiddleware, (c) => authController.updateProfile(c));
authRoute.post("/forgot-password", (c) => authController.forgotPassword(c));
authRoute.post("/verify-otp", (c) => authController.verifyOtp(c));
authRoute.post("/reset-password", (c) => authController.resetPassword(c));
var auth_default = authRoute;

// src/routes/cash.route.ts
import { Hono as Hono3 } from "hono";

// src/schemas/cash.schema.ts
import { z as z2 } from "zod";
var createCashTransactionSchema = z2.object({
  tanggal: z2.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jenis: z2.enum(["pemasukan", "pengeluaran"]),
  kategori: z2.string().min(1).max(100),
  jumlah: z2.number().positive(),
  catatan: z2.string().max(500).optional()
});
var updateCashTransactionSchema = createCashTransactionSchema.partial().superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({ code: z2.ZodIssueCode.custom, path: [], message: "At least one field must be provided" });
  }
});
var cashQuerySchema = z2.object({
  from: z2.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z2.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z2.coerce.number().int().positive().max(100).optional()
});

// src/utils/calculation.ts
function calculateCurrentBalance(transactions) {
  return transactions.reduce((balance, tx) => {
    return tx.type === "income" ? balance + tx.amount : balance - tx.amount;
  }, 0);
}
function calculateAverageDaily(transactions, type, lookbackDays = 30) {
  if (transactions.length === 0) return 0;
  const today = /* @__PURE__ */ new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const filtered = transactions.filter(
    (tx) => tx.type === type && tx.transactionDate >= cutoffStr
  );
  if (filtered.length === 0) {
    const allOfType = transactions.filter((tx) => tx.type === type);
    if (allOfType.length === 0) return 0;
    const total2 = allOfType.reduce((sum, tx) => sum + tx.amount, 0);
    const uniqueDays2 = new Set(allOfType.map((tx) => tx.transactionDate)).size;
    return total2 / Math.max(uniqueDays2, 1);
  }
  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const uniqueDays = new Set(filtered.map((tx) => tx.transactionDate)).size;
  return total / Math.max(uniqueDays, 1);
}
function projectCash(params) {
  const horizonDays = params.horizonDays ?? DEFAULT_HORIZON_DAYS;
  const netDaily = params.avgDailyIncome - params.avgDailyExpense;
  const projection = [];
  for (let day = 0; day <= horizonDays; day++) {
    projection.push({
      day,
      label: `H+${day}`,
      value: params.currentBalance + netDaily * day
    });
  }
  return projection;
}
function findDeficitDay(projection) {
  const deficit = projection.find((point) => point.day > 0 && point.value < 0);
  return deficit ? deficit.day : null;
}
function calculateWeeklyChangePercent(currentBalance, balanceWeekAgo) {
  if (balanceWeekAgo === 0) {
    return currentBalance > 0 ? 100 : 0;
  }
  return (currentBalance - balanceWeekAgo) / Math.abs(balanceWeekAgo) * 100;
}
function projectInventoryItems(items) {
  return items.map((item) => {
    const daysRemaining = item.averageSalesPerDay > 0 ? item.currentStock / item.averageSalesPerDay : Infinity;
    let severity = "info";
    if (daysRemaining < ALERT_THRESHOLDS.inventoryCriticalDays) {
      severity = "critical";
    } else if (daysRemaining < ALERT_THRESHOLDS.inventoryCriticalDays * 2) {
      severity = "warning";
    }
    return {
      itemId: item.id,
      itemName: item.itemName,
      unit: item.unit,
      currentStock: item.currentStock,
      averageSalesPerDay: item.averageSalesPerDay,
      daysRemaining: Number.isFinite(daysRemaining) ? Math.round(daysRemaining * 10) / 10 : 999,
      severity
    };
  });
}
function applyWhatIfParameters(baseIncome, baseExpense, parameters) {
  const expenseIncrease = parameters.expenseIncreasePercentage ?? 0;
  const incomeDecrease = parameters.incomeDecreasePercentage ?? 0;
  const avgDailyIncome = parameters.avgDailyIncome ?? baseIncome * (1 - incomeDecrease / 100);
  const avgDailyExpense = parameters.avgDailyExpense ?? baseExpense * (1 + expenseIncrease / 100);
  return { avgDailyIncome, avgDailyExpense };
}
function classifySimulationScenario(projectedBalance, baselineBalance) {
  const delta = projectedBalance - baselineBalance;
  let label = "Skenario stabil";
  if (projectedBalance < 0) {
    label = "Skenario defisit";
  } else if (delta < 0) {
    label = "Skenario waspada";
  } else if (delta > 0) {
    label = "Skenario positif";
  }
  return { label, delta };
}
function generateAlerts(params) {
  const alerts2 = [];
  const deficitDay = findDeficitDay(params.cashProjection);
  if (deficitDay !== null && deficitDay <= ALERT_THRESHOLDS.cashCriticalDays) {
    alerts2.push({
      alertType: "cash",
      severity: "critical",
      message: `Kas diproyeksikan defisit pada H+${deficitDay}. Segera evaluasi biaya operasional.`,
      triggerValue: deficitDay,
      detail: "Evaluasi pengeluaran operasional dan prioritaskan pemasukan."
    });
  } else if (deficitDay !== null && deficitDay <= 14) {
    alerts2.push({
      alertType: "cash",
      severity: "warning",
      message: `Kas Diperkirakan Menipis dalam 2 Minggu. Proyeksi defisit di H+${deficitDay}.`,
      triggerValue: deficitDay,
      detail: "Perlu evaluasi biaya operasional."
    });
  }
  const criticalItems = params.inventoryProjection.filter((item) => item.severity === "critical");
  if (criticalItems.length > 0) {
    const names = criticalItems.map((item) => item.itemName).join(" & ");
    alerts2.push({
      alertType: "inventory",
      severity: "critical",
      message: `${criticalItems.length} Item Stok Kritis. Segera Isi Ulang dalam <3 Hari`,
      triggerValue: criticalItems.length,
      detail: `${criticalItems.length} item (${names}) diperkirakan habis dalam kurang dari 3 hari.`
    });
  }
  const warningItems = params.inventoryProjection.filter((item) => item.severity === "warning");
  if (warningItems.length > 0 && criticalItems.length === 0) {
    alerts2.push({
      alertType: "inventory",
      severity: "warning",
      message: `${warningItems.length} item stok mendekati batas aman.`,
      triggerValue: warningItems.length,
      detail: "Pertimbangkan restock dalam minggu ini."
    });
  }
  if (alerts2.length === 0) {
    alerts2.push({
      alertType: "cash",
      severity: "info",
      message: "Kondisi kas dan stok dalam batas aman.",
      triggerValue: 0,
      detail: "Lanjutkan pencatatan harian."
    });
  }
  return alerts2;
}

// src/repositories/cash.repository.ts
init_db();
init_schema();
import { and, desc, eq as eq2, gte, lte } from "drizzle-orm";
var cashRepository = {
  findAll: async (businessProfileId, filters) => {
    const conditions = [eq2(cashTransactions.businessProfileId, businessProfileId)];
    if (filters?.from) {
      conditions.push(gte(cashTransactions.transactionDate, filters.from));
    }
    if (filters?.to) {
      conditions.push(lte(cashTransactions.transactionDate, filters.to));
    }
    const query = db.select().from(cashTransactions).where(and(...conditions)).orderBy(desc(cashTransactions.transactionDate), desc(cashTransactions.id));
    if (filters?.limit) {
      return query.limit(filters.limit);
    }
    return query;
  },
  findById: async (id, businessProfileId) => {
    const [tx] = await db.select().from(cashTransactions).where(
      and(
        eq2(cashTransactions.id, id),
        eq2(cashTransactions.businessProfileId, businessProfileId)
      )
    ).limit(1);
    return tx ?? null;
  },
  create: async (input) => {
    const [tx] = await db.insert(cashTransactions).values([input]).returning();
    return tx;
  },
  update: async (id, businessProfileId, input) => {
    const [tx] = await db.update(cashTransactions).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(
      and(
        eq2(cashTransactions.id, id),
        eq2(cashTransactions.businessProfileId, businessProfileId)
      )
    ).returning();
    return tx ?? null;
  },
  delete: async (id, businessProfileId) => {
    const [tx] = await db.delete(cashTransactions).where(
      and(
        eq2(cashTransactions.id, id),
        eq2(cashTransactions.businessProfileId, businessProfileId)
      )
    ).returning();
    return tx ?? null;
  }
};

// src/repositories/inventory.repository.ts
init_db();
init_schema();
import { and as and2, desc as desc2, eq as eq3 } from "drizzle-orm";
var inventoryRepository = {
  findAllItems: async (businessProfileId) => {
    return db.select().from(inventoryItems).where(eq3(inventoryItems.businessProfileId, businessProfileId)).orderBy(desc2(inventoryItems.updatedAt));
  },
  findItemById: async (id, businessProfileId) => {
    const [item] = await db.select().from(inventoryItems).where(
      and2(eq3(inventoryItems.id, id), eq3(inventoryItems.businessProfileId, businessProfileId))
    ).limit(1);
    return item ?? null;
  },
  createItem: async (input) => {
    const [item] = await db.insert(inventoryItems).values([input]).returning();
    return item;
  },
  updateItem: async (id, businessProfileId, input) => {
    const [item] = await db.update(inventoryItems).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(
      and2(eq3(inventoryItems.id, id), eq3(inventoryItems.businessProfileId, businessProfileId))
    ).returning();
    return item ?? null;
  },
  deleteItem: async (id, businessProfileId) => {
    const [item] = await db.delete(inventoryItems).where(
      and2(eq3(inventoryItems.id, id), eq3(inventoryItems.businessProfileId, businessProfileId))
    ).returning();
    return item ?? null;
  },
  findMovements: async (inventoryItemId) => {
    return db.select().from(inventoryMovements).where(eq3(inventoryMovements.inventoryItemId, inventoryItemId)).orderBy(desc2(inventoryMovements.movementDate));
  },
  createMovement: async (input) => {
    const [movement] = await db.insert(inventoryMovements).values([input]).returning();
    return movement;
  }
};

// src/repositories/forecast.repository.ts
init_db();
init_schema();
import { desc as desc3, eq as eq4 } from "drizzle-orm";
var forecastRepository = {
  save: async (input) => {
    const [run] = await db.insert(forecastRuns).values(input).returning();
    return run;
  },
  findLatest: async (businessProfileId) => {
    const [run] = await db.select().from(forecastRuns).where(eq4(forecastRuns.businessProfileId, businessProfileId)).orderBy(desc3(forecastRuns.generatedAt)).limit(1);
    return run ?? null;
  },
  findHistory: async (businessProfileId, limit = 20) => {
    return db.select().from(forecastRuns).where(eq4(forecastRuns.businessProfileId, businessProfileId)).orderBy(desc3(forecastRuns.generatedAt)).limit(limit);
  }
};

// src/repositories/alert.repository.ts
init_db();
init_schema();
import { and as and3, desc as desc4, eq as eq5 } from "drizzle-orm";
var alertRepository = {
  findActive: async (businessProfileId) => {
    return db.select().from(alerts).where(
      and3(eq5(alerts.businessProfileId, businessProfileId), eq5(alerts.status, "active"))
    ).orderBy(desc4(alerts.createdAt));
  },
  findById: async (id, businessProfileId) => {
    const [alert] = await db.select().from(alerts).where(and3(eq5(alerts.id, id), eq5(alerts.businessProfileId, businessProfileId))).limit(1);
    return alert ?? null;
  },
  replaceActive: async (businessProfileId, newAlerts) => {
    await db.update(alerts).set({ status: "resolved", updatedAt: /* @__PURE__ */ new Date() }).where(
      and3(eq5(alerts.businessProfileId, businessProfileId), eq5(alerts.status, "active"))
    );
    if (newAlerts.length === 0) return [];
    return db.insert(alerts).values(
      newAlerts.map((alert) => ({
        businessProfileId,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        triggerValue: alert.triggerValue,
        status: "active"
      }))
    ).returning();
  },
  markRead: async (id, businessProfileId) => {
    const [alert] = await db.update(alerts).set({ status: "read", updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq5(alerts.id, id), eq5(alerts.businessProfileId, businessProfileId))).returning();
    return alert ?? null;
  },
  markResolved: async (id, businessProfileId) => {
    const [alert] = await db.update(alerts).set({ status: "resolved", updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq5(alerts.id, id), eq5(alerts.businessProfileId, businessProfileId))).returning();
    return alert ?? null;
  }
};

// src/services/forecast.service.ts
var forecastService = {
  getLatest: async (businessProfileId) => {
    try {
      const latest = await forecastRepository.findLatest(businessProfileId);
      if (latest) {
        return ok({
          forecast_id: latest.id,
          generated_at: latest.generatedAt,
          ...latest.resultJson
        });
      }
    } catch (error) {
      return fail("Database unavailable while loading the forecast", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
    return fail("No forecast found");
  },
  recalculate: async (businessProfileId) => {
    let transactions = [];
    let inventoryItems2 = [];
    const txRows = await cashRepository.findAll(businessProfileId);
    transactions = txRows.map((tx) => ({
      type: tx.type === "expense" ? "expense" : "income",
      amount: Number(tx.amount ?? 0),
      transactionDate: typeof tx.transactionDate === "string" ? tx.transactionDate : ""
    }));
    const inventoryRows = await inventoryRepository.findAllItems(businessProfileId);
    inventoryItems2 = inventoryRows.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      unit: item.unit,
      currentStock: Number(item.currentStock ?? 0),
      averageSalesPerDay: Number(item.averageSalesPerDay ?? 0)
    }));
    const currentBalance = calculateCurrentBalance(transactions);
    const avgIncome = calculateAverageDaily(transactions, "income");
    const avgExpense = calculateAverageDaily(transactions, "expense");
    const cashProjection = projectCash({ currentBalance, avgDailyIncome: avgIncome, avgDailyExpense: avgExpense, horizonDays: DEFAULT_HORIZON_DAYS });
    const inventoryProjection = projectInventoryItems(inventoryItems2);
    const alerts2 = generateAlerts({ cashProjection, inventoryProjection });
    const result = {
      cash_projection: cashProjection.map((point) => ({ day: point.day, label: point.label, value: point.value })),
      inventory_projection: inventoryProjection.map((item) => ({
        item_id: item.itemId,
        item_name: item.itemName,
        unit: item.unit,
        current_stock: item.currentStock,
        average_sales_per_day: item.averageSalesPerDay,
        days_remaining: item.daysRemaining,
        severity: item.severity
      })),
      cash_summary: {
        current_balance: currentBalance,
        change_from_last_week_pct: calculateWeeklyChangePercent(currentBalance, currentBalance),
        projected_30d: cashProjection[DEFAULT_HORIZON_DAYS]?.value ?? 0,
        deficit_at_day: findDeficitDay(cashProjection) ?? 0
      },
      alert_summary: alerts2.map((alert) => ({
        type: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        detail: alert.detail ?? ""
      }))
    };
    await forecastRepository.save({
      businessProfileId,
      forecastType: "cash",
      sourceSnapshotJson: {},
      resultJson: result,
      horizonDays: DEFAULT_HORIZON_DAYS
    });
    await alertRepository.replaceActive(
      businessProfileId,
      alerts2.map((alert) => ({
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        triggerValue: String(alert.triggerValue ?? 0)
      }))
    );
    return ok(result);
  },
  history: async (businessProfileId) => {
    try {
      const history = await forecastRepository.findHistory(businessProfileId);
      return ok({ history: history.map((run) => ({ id: run.id, generated_at: run.generatedAt, horizon_days: run.horizonDays })) });
    } catch (error) {
      return fail("Database unavailable while loading forecast history", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  }
};

// src/services/cash.service.ts
var nowIso2 = () => (/* @__PURE__ */ new Date()).toISOString();
var normalizeTransaction = (tx) => ({
  id: String(tx.id),
  transaction_date: typeof tx.transactionDate === "string" ? tx.transactionDate : "",
  type: tx.type === "expense" ? "pengeluaran" : "pemasukan",
  category: typeof tx.category === "string" ? tx.category : "",
  amount: Number(tx.amount ?? 0),
  note: typeof tx.note === "string" ? tx.note : void 0,
  created_at: typeof tx.createdAt === "string" ? tx.createdAt : nowIso2(),
  updated_at: typeof tx.updatedAt === "string" ? tx.updatedAt : nowIso2()
});
var cashService = {
  list: async (businessProfileId, query) => {
    const fromDate = query?.from_date;
    const toDate = query?.to_date;
    try {
      const rows = await cashRepository.findAll(businessProfileId, { from: fromDate, to: toDate });
      let transactions = rows.map((row) => normalizeTransaction(row));
      if (query?.type) {
        transactions = transactions.filter((tx) => tx.type === query.type);
      }
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const paged = transactions.slice(offset, offset + limit);
      return ok({ transactions: paged, total: transactions.length, limit, offset });
    } catch (error) {
      return fail("Database unavailable while loading cash transactions", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  get: async (businessProfileId, id) => {
    try {
      const transaction = await cashRepository.findById(id, businessProfileId);
      if (!transaction) {
        return fail("Transaction not found");
      }
      return ok(normalizeTransaction(transaction));
    } catch (error) {
      return fail("Database unavailable while loading the transaction", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  create: async (businessProfileId, input) => {
    const parsed = createCashTransactionSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid cash transaction payload", parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })));
    }
    try {
      const persisted = await cashRepository.create({
        businessProfileId,
        transactionDate: parsed.data.tanggal,
        type: parsed.data.jenis === "pengeluaran" ? "expense" : "income",
        amount: String(parsed.data.jumlah),
        category: parsed.data.kategori,
        note: parsed.data.catatan
      });
      const normalized = normalizeTransaction(persisted);
      await forecastService.recalculate(businessProfileId);
      return created(normalized, "Transaksi berhasil dibuat");
    } catch (error) {
      return fail("Database unavailable while creating the transaction", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  update: async (businessProfileId, id, input) => {
    const parsed = updateCashTransactionSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid cash transaction payload", parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })));
    }
    try {
      const updated = await cashRepository.update(id, businessProfileId, {
        transactionDate: parsed.data.tanggal,
        type: parsed.data.jenis ? parsed.data.jenis === "pengeluaran" ? "expense" : "income" : void 0,
        amount: parsed.data.jumlah ? String(parsed.data.jumlah) : void 0,
        category: parsed.data.kategori,
        note: parsed.data.catatan
      });
      if (!updated) {
        return fail("Transaction not found");
      }
      const transaction = normalizeTransaction(updated);
      await forecastService.recalculate(businessProfileId);
      return ok(transaction, "Transaksi berhasil diperbarui");
    } catch (error) {
      return fail("Database unavailable while updating the transaction", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  delete: async (businessProfileId, id) => {
    try {
      const deleted = await cashRepository.delete(id, businessProfileId);
      if (!deleted) {
        return fail("Transaction not found");
      }
      await forecastService.recalculate(businessProfileId);
      return ok({}, "Transaksi berhasil dihapus");
    } catch (error) {
      return fail("Database unavailable while deleting the transaction", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  }
};

// src/controllers/cash.controller.ts
var cashController = {
  list: async (c) => {
    const auth = c.get("auth");
    const query = c.req.query();
    const result = await cashService.list(auth.businessProfileId, {
      limit: query.limit ? Number(query.limit) : void 0,
      offset: query.offset ? Number(query.offset) : void 0,
      type: query.type,
      from_date: query.from_date,
      to_date: query.to_date
    });
    if (result.success) {
      return c.json(result.data, 200);
    }
    return c.json(result, 400);
  },
  create: async (c) => {
    const auth = c.get("auth");
    const payload = await c.req.json().catch(() => ({}));
    const result = await cashService.create(auth.businessProfileId, payload);
    if (result.success) {
      return c.json(result.data, 201);
    }
    return c.json(result, 400);
  },
  getById: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await cashService.get(auth.businessProfileId, id);
    if (result.success) {
      return c.json(result.data, 200);
    }
    return c.json(result, 404);
  },
  update: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const payload = await c.req.json().catch(() => ({}));
    const result = await cashService.update(auth.businessProfileId, id, payload);
    if (result.success) {
      return c.json(result.data, 200);
    }
    return c.json(result, 400);
  },
  delete: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await cashService.delete(auth.businessProfileId, id);
    if (result.success) {
      return c.json(result.data, 200);
    }
    return c.json(result, 404);
  }
};

// src/routes/cash.route.ts
var cashRoute = new Hono3();
cashRoute.get("/", authMiddleware, (c) => cashController.list(c));
cashRoute.post("/", authMiddleware, (c) => cashController.create(c));
cashRoute.get("/:id", authMiddleware, (c) => cashController.getById(c));
cashRoute.put("/:id", authMiddleware, (c) => cashController.update(c));
cashRoute.patch("/:id", authMiddleware, (c) => cashController.update(c));
cashRoute.delete("/:id", authMiddleware, (c) => cashController.delete(c));
var cash_route_default = cashRoute;

// src/routes/inventory.route.ts
import { Hono as Hono4 } from "hono";

// src/schemas/inventory.schema.ts
import { z as z3 } from "zod";
var createInventoryItemSchema = z3.object({
  namaBarang: z3.string().min(1).max(255),
  jumlahStok: z3.number().min(0),
  rataRataTerjualPerHari: z3.number().min(0),
  satuan: z3.enum(["kg", "liter", "pcs", "pack"]),
  minimum_threshold: z3.number().min(0).optional()
});
var updateInventoryItemSchema = createInventoryItemSchema.partial().superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({ code: z3.ZodIssueCode.custom, path: [], message: "At least one field must be provided" });
  }
});
var createInventoryMovementSchema = z3.object({
  inventory_item_id: z3.number().int().positive(),
  movement_date: z3.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  movement_type: z3.enum(["in", "out", "adjustment"]),
  quantity: z3.number().positive(),
  note: z3.string().max(500).optional()
});

// src/services/inventory.service.ts
var nowIso3 = () => (/* @__PURE__ */ new Date()).toISOString();
function buildItemResponse(item) {
  const daysRemaining = item.averageSalesPerDay > 0 ? item.currentStock / item.averageSalesPerDay : Infinity;
  const severity = daysRemaining <= 3 ? "critical" : daysRemaining <= 7 ? "warning" : "info";
  return {
    id: item.id,
    item_name: item.itemName,
    current_stock: item.currentStock,
    average_sales_per_day: item.averageSalesPerDay,
    unit: item.unit,
    minimum_threshold: item.minimumThreshold,
    days_remaining: Number.isFinite(daysRemaining) ? Math.floor(daysRemaining) : Infinity,
    severity,
    created_at: item.createdAt,
    updated_at: item.updatedAt
  };
}
var normalizeItem = (item) => ({
  id: String(item.id),
  itemName: typeof item.itemName === "string" ? item.itemName : "",
  currentStock: Number(item.currentStock ?? 0),
  averageSalesPerDay: Number(item.averageSalesPerDay ?? 0),
  unit: typeof item.unit === "string" ? item.unit : "pcs",
  minimumThreshold: Number(item.minimumThreshold ?? 0),
  createdAt: typeof item.createdAt === "string" ? item.createdAt : nowIso3(),
  updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : nowIso3()
});
var inventoryService = {
  list: async (businessProfileId) => {
    try {
      const items = await inventoryRepository.findAllItems(businessProfileId);
      return ok({ items: items.map((item) => buildItemResponse(normalizeItem(item))), total: items.length });
    } catch (error) {
      return fail("Database unavailable while loading inventory items", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  create: async (businessProfileId, input) => {
    const parsed = createInventoryItemSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid inventory payload", parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })));
    }
    try {
      const persisted = await inventoryRepository.createItem({
        businessProfileId,
        itemName: parsed.data.namaBarang,
        currentStock: String(parsed.data.jumlahStok),
        averageSalesPerDay: String(parsed.data.rataRataTerjualPerHari),
        unit: parsed.data.satuan,
        minimumThreshold: "0"
      });
      const normalized = normalizeItem(persisted);
      await forecastService.recalculate(businessProfileId);
      return created(buildItemResponse(normalized), "Stok berhasil ditambahkan");
    } catch (error) {
      return fail("Database unavailable while creating the inventory item", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  update: async (businessProfileId, id, input) => {
    const parsed = updateInventoryItemSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Invalid inventory payload", parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })));
    }
    try {
      const updated = await inventoryRepository.updateItem(id, businessProfileId, {
        itemName: parsed.data.namaBarang,
        currentStock: parsed.data.jumlahStok ? String(parsed.data.jumlahStok) : void 0,
        averageSalesPerDay: parsed.data.rataRataTerjualPerHari ? String(parsed.data.rataRataTerjualPerHari) : void 0,
        unit: parsed.data.satuan
      });
      if (!updated) {
        return fail("Item not found");
      }
      const normalized = normalizeItem(updated);
      await forecastService.recalculate(businessProfileId);
      return ok(buildItemResponse(normalized), "Stok berhasil diperbarui");
    } catch (error) {
      return fail("Database unavailable while updating the inventory item", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  delete: async (businessProfileId, id) => {
    try {
      const deleted = await inventoryRepository.deleteItem(id, businessProfileId);
      if (!deleted) {
        return fail("Item not found");
      }
      await forecastService.recalculate(businessProfileId);
      return ok({}, "Stok berhasil dihapus");
    } catch (error) {
      return fail("Database unavailable while deleting the inventory item", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  }
};

// src/controllers/inventory.controller.ts
var inventoryController = {
  list: async (c) => {
    const auth = c.get("auth");
    const result = await inventoryService.list(auth.businessProfileId);
    if (result.success) {
      return c.json(result.data, 200);
    }
    return c.json(result, 400);
  },
  create: async (c) => {
    const auth = c.get("auth");
    const payload = await c.req.json().catch(() => ({}));
    const result = await inventoryService.create(auth.businessProfileId, payload);
    if (result.success) {
      return c.json(result.data, 201);
    }
    return c.json(result, 400);
  },
  update: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const payload = await c.req.json().catch(() => ({}));
    const result = await inventoryService.update(auth.businessProfileId, id, payload);
    if (result.success) {
      return c.json(result.data, 200);
    }
    return c.json(result, 400);
  },
  delete: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await inventoryService.delete(auth.businessProfileId, id);
    if (result.success) {
      return c.json(result.data, 200);
    }
    return c.json(result, 404);
  }
};

// src/routes/inventory.route.ts
var inventoryRoute = new Hono4();
inventoryRoute.get("/", authMiddleware, (c) => inventoryController.list(c));
inventoryRoute.post("/", authMiddleware, (c) => inventoryController.create(c));
inventoryRoute.put("/:id", authMiddleware, (c) => inventoryController.update(c));
inventoryRoute.patch("/:id", authMiddleware, (c) => inventoryController.update(c));
inventoryRoute.delete("/:id", authMiddleware, (c) => inventoryController.delete(c));
var inventory_route_default = inventoryRoute;

// src/routes/forecast.route.ts
import { Hono as Hono5 } from "hono";

// src/controllers/forecast.controller.ts
var forecastController = {
  getLatest: async (c) => {
    const auth = c.get("auth");
    const result = await forecastService.getLatest(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 404);
  },
  recalculate: async (c) => {
    const auth = c.get("auth");
    const result = await forecastService.recalculate(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 400);
  },
  history: async (c) => {
    const auth = c.get("auth");
    const result = await forecastService.history(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 400);
  }
};

// src/routes/forecast.route.ts
var forecastRoute = new Hono5();
forecastRoute.get("/", authMiddleware, (c) => forecastController.getLatest(c));
forecastRoute.post("/recalculate", authMiddleware, (c) => forecastController.recalculate(c));
forecastRoute.get("/history", authMiddleware, (c) => forecastController.history(c));
var forecast_route_default = forecastRoute;

// src/routes/whatif.route.ts
import { Hono as Hono6 } from "hono";

// src/schemas/whatif.schema.ts
import { z as z4 } from "zod";
var whatIfSimulateSchema = z4.object({
  scenario_name: z4.string().min(1).max(255).optional(),
  expense_increase_pct: z4.number().min(0).max(100).optional(),
  income_decrease_pct: z4.number().min(0).max(100).optional(),
  avg_income_per_day: z4.number().min(0).optional(),
  avg_expense_per_day: z4.number().min(0).optional(),
  parameters: z4.object({
    expense_increase_percentage: z4.number().min(0).max(100).optional(),
    income_decrease_percentage: z4.number().min(0).max(100).optional(),
    avg_daily_income: z4.number().min(0).optional(),
    avg_daily_expense: z4.number().min(0).optional()
  }).optional()
}).transform((value) => ({
  ...value,
  parameters: {
    expense_increase_percentage: value.expense_increase_pct ?? value.parameters?.expense_increase_percentage ?? 0,
    income_decrease_percentage: value.income_decrease_pct ?? value.parameters?.income_decrease_percentage ?? 0,
    avg_daily_income: value.avg_income_per_day ?? value.parameters?.avg_daily_income,
    avg_daily_expense: value.avg_expense_per_day ?? value.parameters?.avg_daily_expense
  }
}));
var whatIfResetSchema = z4.object({}).optional();

// src/utils/scenario-name.ts
function generateScenarioName(params) {
  const expenseIncrease = params.expenseIncreasePercentage ?? 0;
  const incomeDecrease = params.incomeDecreasePercentage ?? 0;
  return `Pengeluaran naik ${expenseIncrease}%, Pemasukan turun ${incomeDecrease}%`;
}

// src/repositories/scenario.repository.ts
init_db();
init_schema();
import { and as and4, desc as desc5, eq as eq6 } from "drizzle-orm";
var scenarioRepository = {
  create: async (input) => {
    const [scenario] = await db.insert(whatIfScenarios).values([input]).returning();
    return scenario;
  },
  findAll: async (businessProfileId) => {
    return db.select().from(whatIfScenarios).where(eq6(whatIfScenarios.businessProfileId, businessProfileId)).orderBy(desc5(whatIfScenarios.createdAt));
  },
  findById: async (id, businessProfileId) => {
    const [scenario] = await db.select().from(whatIfScenarios).where(
      and4(eq6(whatIfScenarios.id, id), eq6(whatIfScenarios.businessProfileId, businessProfileId))
    ).limit(1);
    return scenario ?? null;
  },
  delete: async (id, businessProfileId) => {
    const [scenario] = await db.delete(whatIfScenarios).where(
      and4(eq6(whatIfScenarios.id, id), eq6(whatIfScenarios.businessProfileId, businessProfileId))
    ).returning();
    return scenario ?? null;
  }
};

// src/services/whatif.service.ts
var whatIfService = {
  simulate: async (businessProfileId, input) => {
    const parsed = whatIfSimulateSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: "Invalid what-if payload", errors: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) };
    }
    const currentBalance = 0;
    const baselineIncome = 18e5;
    const baselineExpense = 1e6;
    const values = applyWhatIfParameters(baselineIncome, baselineExpense, {
      expenseIncreasePercentage: parsed.data.parameters?.expense_increase_percentage ?? 0,
      incomeDecreasePercentage: parsed.data.parameters?.income_decrease_percentage ?? 0,
      avgDailyIncome: parsed.data.parameters?.avg_daily_income,
      avgDailyExpense: parsed.data.parameters?.avg_daily_expense
    });
    const projection = projectCash({ currentBalance, avgDailyIncome: values.avgDailyIncome, avgDailyExpense: values.avgDailyExpense, horizonDays: DEFAULT_HORIZON_DAYS });
    const scenario = classifySimulationScenario(projection[DEFAULT_HORIZON_DAYS].value, currentBalance);
    const scenarioName = generateScenarioName({
      expenseIncreasePercentage: parsed.data.parameters?.expense_increase_percentage ?? 0,
      incomeDecreasePercentage: parsed.data.parameters?.income_decrease_percentage ?? 0
    });
    const result = {
      scenario_name: scenarioName,
      scenario_label: scenario.label,
      estimated_cash_h30: projection[DEFAULT_HORIZON_DAYS].value,
      diff_from_baseline: scenario.delta,
      cash_projection: projection.map((point) => ({ day: point.day, label: point.label, value: point.value }))
    };
    try {
      const persisted = await scenarioRepository.create({
        businessProfileId,
        scenarioName,
        parameterJson: parsed.data,
        resultJson: result
      });
      return ok({ ...result, scenario_id: String(persisted.id) }, "Skenario berhasil disimpan");
    } catch (error) {
      return fail("Database unavailable while saving the scenario", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  history: async (businessProfileId) => {
    try {
      const scenarios = await scenarioRepository.findAll(businessProfileId);
      return ok({
        scenarios: scenarios.map((scenario) => {
          const resultJson = scenario.resultJson;
          return {
            id: scenario.id,
            scenario_name: scenario.scenarioName,
            estimated_cash_h30: resultJson.estimated_cash_h30,
            created_at: scenario.createdAt
          };
        })
      });
    } catch (error) {
      return fail("Database unavailable while loading scenarios", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  getById: async (businessProfileId, id) => {
    try {
      const scenario = await scenarioRepository.findById(id, businessProfileId);
      if (!scenario) return fail("Scenario not found");
      return ok({
        id: scenario.id,
        scenario_name: scenario.scenarioName,
        parameter_json: scenario.parameterJson,
        result_json: scenario.resultJson,
        created_at: scenario.createdAt
      });
    } catch (error) {
      return fail("Database unavailable while loading the scenario", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  delete: async (businessProfileId, id) => {
    try {
      const deleted = await scenarioRepository.delete(id, businessProfileId);
      if (!deleted) return fail("Scenario not found");
      return ok({}, "Skenario berhasil dihapus");
    } catch (error) {
      return fail("Database unavailable while deleting the scenario", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  }
};

// src/controllers/whatif.controller.ts
var whatIfController = {
  simulate: async (c) => {
    const auth = c.get("auth");
    const payload = await c.req.json().catch(() => ({}));
    const result = await whatIfService.simulate(auth.businessProfileId, payload);
    return c.json(result, result.success ? 200 : 400);
  },
  history: async (c) => {
    const auth = c.get("auth");
    const result = await whatIfService.history(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 400);
  },
  getById: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await whatIfService.getById(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 404);
  },
  delete: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await whatIfService.delete(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 404);
  }
};

// src/routes/whatif.route.ts
var whatIfRoute = new Hono6();
whatIfRoute.post("/simulate", authMiddleware, (c) => whatIfController.simulate(c));
whatIfRoute.get("/history", authMiddleware, (c) => whatIfController.history(c));
whatIfRoute.get("/:id", authMiddleware, (c) => whatIfController.getById(c));
whatIfRoute.delete("/:id", authMiddleware, (c) => whatIfController.delete(c));
var whatif_route_default = whatIfRoute;

// src/routes/alert.route.ts
import { Hono as Hono7 } from "hono";

// src/services/alert.service.ts
var normalizeAlert = (alert) => ({
  id: String(alert.id),
  alert_type: alert.alertType ?? alert.alert_type,
  severity: alert.severity,
  message: alert.message,
  detail: alert.detail ?? "",
  status: alert.status,
  trigger_value: alert.triggerValue ?? alert.trigger_value,
  created_at: alert.createdAt ?? alert.created_at
});
var alertService = {
  list: async (businessProfileId, query) => {
    try {
      const alerts2 = await alertRepository.findActive(businessProfileId);
      const normalized = alerts2.map((alert) => normalizeAlert(alert));
      if (query?.status) {
        return ok({ alerts: normalized.filter((alert) => alert.status === query.status), total: normalized.length });
      }
      return ok({ alerts: normalized, total: normalized.length });
    } catch (error) {
      return fail("Database unavailable while loading alerts", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  get: async (businessProfileId, id) => {
    try {
      const alert = await alertRepository.findById(id, businessProfileId);
      if (!alert) return fail("Alert not found");
      return ok(normalizeAlert(alert));
    } catch (error) {
      return fail("Database unavailable while loading the alert", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  markRead: async (businessProfileId, id) => {
    try {
      const alert = await alertRepository.markRead(id, businessProfileId);
      if (!alert) return fail("Alert not found");
      return ok(normalizeAlert(alert), "Alert marked as read");
    } catch (error) {
      return fail("Database unavailable while updating the alert", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  },
  markResolved: async (businessProfileId, id) => {
    try {
      const alert = await alertRepository.markResolved(id, businessProfileId);
      if (!alert) return fail("Alert not found");
      return ok(normalizeAlert(alert), "Alert marked as resolved");
    } catch (error) {
      return fail("Database unavailable while updating the alert", [{ field: "database", message: error instanceof Error ? error.message : "Unknown database error" }]);
    }
  }
};

// src/controllers/alert.controller.ts
var alertController = {
  list: async (c) => {
    const auth = c.get("auth");
    const query = c.req.query();
    const result = await alertService.list(auth.businessProfileId, { status: query.status });
    return c.json(result, result.success ? 200 : 400);
  },
  getById: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await alertService.get(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 404);
  },
  markRead: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await alertService.markRead(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 400);
  },
  markResolved: async (c) => {
    const auth = c.get("auth");
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }
    const result = await alertService.markResolved(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 400);
  }
};

// src/routes/alert.route.ts
var alertRoute = new Hono7();
alertRoute.get("/", authMiddleware, (c) => alertController.list(c));
alertRoute.get("/:id", authMiddleware, (c) => alertController.getById(c));
alertRoute.patch("/:id/read", authMiddleware, (c) => alertController.markRead(c));
alertRoute.patch("/:id/resolve", authMiddleware, (c) => alertController.markResolved(c));
var alert_route_default = alertRoute;

// src/openapi.ts
var openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Kasandra API",
    version: "1.0.0",
    description: "OpenAPI contract for the Kasandra backend so frontend can integrate against stable request and response shapes."
  },
  servers: [
    { url: "http://localhost:3000", description: "Local development server" },
    { url: "https://backend-kasandra.vercel.app", description: "Production server (Vercel)" }
  ],
  tags: [
    { name: "Auth", description: "Authentication and profile endpoints" },
    { name: "Cash", description: "Cash transaction management" },
    { name: "Inventory", description: "Inventory item management" },
    { name: "Forecast", description: "Forecast generation and history" },
    { name: "What-if", description: "Scenario simulation and history" },
    { name: "Alerts", description: "Alert listing and state changes" },
    { name: "Health", description: "Service health checks" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Backend is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  name: { type: "string" },
                  namaLengkap: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  kataSandi: { type: "string", minLength: 8 },
                  business_name: { type: "string" },
                  businessName: { type: "string" },
                  namaUsaha: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "User created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } }
          },
          "400": { description: "Invalid payload" }
        }
      }
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email/password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Login succeeded", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "401": { description: "Invalid credentials" }
        }
      }
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      }
    },
    "/api/v1/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Start Google OAuth flow",
        responses: {
          "302": { description: "Redirect to Google OAuth" }
        }
      }
    },
    "/api/v1/cash-transactions": {
      get: {
        tags: ["Cash"],
        summary: "List cash transactions",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" }, description: "Maximum number of records to return" },
          { name: "offset", in: "query", schema: { type: "integer" }, description: "Number of records to skip" },
          { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] } },
          { name: "from_date", in: "query", schema: { type: "string", format: "date" } },
          { name: "to_date", in: "query", schema: { type: "string", format: "date" } }
        ],
        responses: {
          "200": { description: "Cash transaction list", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      },
      post: {
        tags: ["Cash"],
        summary: "Create a cash transaction",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type", "amount", "transaction_date"],
                properties: {
                  type: { type: "string", enum: ["income", "expense"] },
                  amount: { type: "number" },
                  transaction_date: { type: "string", format: "date" },
                  description: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Invalid payload" }
        }
      }
    },
    "/api/v1/cash-transactions/{id}": {
      get: {
        tags: ["Cash"],
        summary: "Get a cash transaction by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Transaction found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "404": { description: "Transaction not found" }
        }
      },
      patch: {
        tags: ["Cash"],
        summary: "Update a cash transaction",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } }
        },
        responses: {
          "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Invalid payload" }
        }
      },
      delete: {
        tags: ["Cash"],
        summary: "Delete a cash transaction",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "404": { description: "Not found" }
        }
      }
    },
    "/api/v1/inventory-items": {
      get: {
        tags: ["Inventory"],
        summary: "List inventory items",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Inventory list", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      },
      post: {
        tags: ["Inventory"],
        summary: "Create an inventory item",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["item_name", "unit", "current_stock", "average_sales_per_day"],
                properties: {
                  item_name: { type: "string" },
                  unit: { type: "string" },
                  current_stock: { type: "number" },
                  average_sales_per_day: { type: "number" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Invalid payload" }
        }
      }
    },
    "/api/v1/inventory-items/{id}": {
      patch: {
        tags: ["Inventory"],
        summary: "Update an inventory item",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: {
          "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Invalid payload" }
        }
      },
      delete: {
        tags: ["Inventory"],
        summary: "Delete an inventory item",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "404": { description: "Not found" }
        }
      }
    },
    "/api/v1/forecast": {
      get: {
        tags: ["Forecast"],
        summary: "Get latest forecast",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Latest forecast", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "404": { description: "No forecast found" }
        }
      }
    },
    "/api/v1/forecast/recalculate": {
      post: {
        tags: ["Forecast"],
        summary: "Recalculate forecast",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Forecast recalculated", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Unable to recalculate" }
        }
      }
    },
    "/api/v1/forecast/history": {
      get: {
        tags: ["Forecast"],
        summary: "Get forecast history",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Forecast history", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      }
    },
    "/api/v1/what-if/simulate": {
      post: {
        tags: ["What-if"],
        summary: "Simulate a what-if scenario",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["scenario_name", "inputs"],
                properties: {
                  scenario_name: { type: "string" },
                  inputs: { type: "object" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Scenario simulated", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Invalid payload" }
        }
      }
    },
    "/api/v1/what-if/history": {
      get: {
        tags: ["What-if"],
        summary: "List what-if history",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Scenario history", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      }
    },
    "/api/v1/what-if/{id}": {
      get: {
        tags: ["What-if"],
        summary: "Get a specific what-if scenario",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Scenario found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "404": { description: "Scenario not found" }
        }
      },
      delete: {
        tags: ["What-if"],
        summary: "Delete a what-if scenario",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "404": { description: "Not found" }
        }
      }
    },
    "/api/v1/alerts": {
      get: {
        tags: ["Alerts"],
        summary: "List alerts",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "status", in: "query", schema: { type: "string", enum: ["active", "read", "resolved"] } }],
        responses: {
          "200": { description: "Alerts list", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      }
    },
    "/api/v1/alerts/{id}": {
      get: {
        tags: ["Alerts"],
        summary: "Get a single alert",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Alert found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "404": { description: "Alert not found" }
        }
      }
    },
    "/api/v1/alerts/{id}/read": {
      patch: {
        tags: ["Alerts"],
        summary: "Mark an alert as read",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Alert updated", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Unable to update" }
        }
      }
    },
    "/api/v1/alerts/{id}/resolve": {
      patch: {
        tags: ["Alerts"],
        summary: "Resolve an alert",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Alert updated", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          "400": { description: "Unable to update" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {},
          error: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" }
              }
            }
          }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              access_token: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  full_name: { type: "string" },
                  email: { type: "string", format: "email" }
                }
              },
              business_profile: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  business_name: { type: "string" }
                }
              },
              is_new_user: { type: "boolean" }
            }
          }
        }
      }
    }
  }
};

// src/app.ts
init_env();
void Promise.resolve().then(() => (init_db(), db_exports)).catch(() => void 0);
var app = new Hono8();
var isOriginAllowed = (origin) => {
  if (origin === env.frontendUrl) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (env.nodeEnv === "development" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
};
app.options("*", (c) => {
  const origin = c.req.header("origin") ?? "";
  const allowedOrigin = isOriginAllowed(origin) ? origin : env.frontendUrl;
  return c.text("OK", {
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true"
    }
  });
});
app.use("*", async (c, next) => {
  await next();
  const origin = c.req.header("origin") ?? "";
  if (origin && isOriginAllowed(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return c;
});
app.use("*", loggerMiddleware);
app.use("*", errorMiddleware);
app.get("/docs", swaggerUI({ url: "/openapi.json" }));
app.get("/docs{*}", swaggerUI({ url: "/openapi.json" }));
app.get("/openapi.json", (c) => c.json(openApiSpec));
app.route("/health", health_route_default);
app.route(`${API_PREFIX}/health`, health_route_default);
app.route(`${API_PREFIX}/auth`, auth_default);
app.route(`${API_PREFIX}/cash-transactions`, cash_route_default);
app.route(`${API_PREFIX}/inventory-items`, inventory_route_default);
app.route(`${API_PREFIX}/forecast`, forecast_route_default);
app.route(`${API_PREFIX}/what-if`, whatif_route_default);
app.route(`${API_PREFIX}/alerts`, alert_route_default);
var app_default = app;

// src/vercel-handler.ts
var GET = handle(app_default);
var POST = handle(app_default);
var PUT = handle(app_default);
var PATCH = handle(app_default);
var DELETE = handle(app_default);
var OPTIONS = handle(app_default);
export {
  DELETE,
  GET,
  OPTIONS,
  PATCH,
  POST,
  PUT
};
