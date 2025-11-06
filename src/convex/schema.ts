import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles for WasteChain
export const ROLES = {
  ADMIN: "admin",
  CITIZEN: "citizen",
  COLLECTOR: "collector",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.CITIZEN),
  v.literal(ROLES.COLLECTOR),
);
export type Role = Infer<typeof roleValidator>;

// Material types for recycling
export const MATERIAL_TYPES = {
  PLASTIC: "plastic",
  PAPER: "paper",
  GLASS: "glass",
  METAL: "metal",
  ELECTRONICS: "electronics",
  ORGANIC: "organic",
} as const;

export const materialTypeValidator = v.union(
  v.literal(MATERIAL_TYPES.PLASTIC),
  v.literal(MATERIAL_TYPES.PAPER),
  v.literal(MATERIAL_TYPES.GLASS),
  v.literal(MATERIAL_TYPES.METAL),
  v.literal(MATERIAL_TYPES.ELECTRONICS),
  v.literal(MATERIAL_TYPES.ORGANIC),
);

// Pickup request status
export const PICKUP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const pickupStatusValidator = v.union(
  v.literal(PICKUP_STATUS.PENDING),
  v.literal(PICKUP_STATUS.ACCEPTED),
  v.literal(PICKUP_STATUS.IN_PROGRESS),
  v.literal(PICKUP_STATUS.COMPLETED),
  v.literal(PICKUP_STATUS.CANCELLED),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      
      // WasteChain specific fields
      ecoPoints: v.optional(v.number()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      
      // Collector specific
      isVerified: v.optional(v.boolean()),
      vehicleNumber: v.optional(v.string()),
      totalCollections: v.optional(v.number()),
      rating: v.optional(v.number()),
    })
      .index("email", ["email"])
      .index("role", ["role"]),

    pickupRequests: defineTable({
      citizenId: v.id("users"),
      collectorId: v.optional(v.id("users")),
      materialType: materialTypeValidator,
      estimatedWeight: v.number(),
      actualWeight: v.optional(v.number()),
      status: pickupStatusValidator,
      address: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      notes: v.optional(v.string()),
      scheduledDate: v.optional(v.number()),
      completedDate: v.optional(v.number()),
      ecoPointsEarned: v.optional(v.number()),
      blockchainTxHash: v.optional(v.string()),
      citizenRating: v.optional(v.number()),
      citizenFeedback: v.optional(v.string()),
      collectorRating: v.optional(v.number()),
      collectorFeedback: v.optional(v.string()),
    })
      .index("citizenId", ["citizenId"])
      .index("collectorId", ["collectorId"])
      .index("status", ["status"]),

    transactions: defineTable({
      userId: v.id("users"),
      type: v.union(v.literal("earn"), v.literal("redeem")),
      amount: v.number(),
      description: v.string(),
      pickupRequestId: v.optional(v.id("pickupRequests")),
      blockchainTxHash: v.optional(v.string()),
    }).index("userId", ["userId"]),

    partnerStores: defineTable({
      name: v.string(),
      category: v.string(),
      address: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      redemptionRate: v.number(), // EcoPoints per dollar
      logo: v.optional(v.string()),
      isActive: v.boolean(),
    }),

    redemptions: defineTable({
      userId: v.id("users"),
      storeId: v.id("partnerStores"),
      ecoPointsUsed: v.number(),
      valueRedeemed: v.number(),
      qrCode: v.string(),
      status: v.union(v.literal("pending"), v.literal("completed"), v.literal("expired")),
      expiresAt: v.number(),
    })
      .index("userId", ["userId"])
      .index("qrCode", ["qrCode"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;