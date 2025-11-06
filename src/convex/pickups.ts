import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Create a new pickup request (now creates as PENDING, not auto-completed)
export const createPickupRequest = mutation({
  args: {
    materialType: v.string(),
    estimatedWeight: v.number(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    notes: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Create pickup request as PENDING (not auto-completed)
    const pickupId = await ctx.db.insert("pickupRequests", {
      citizenId: userId,
      materialType: args.materialType as any,
      estimatedWeight: args.estimatedWeight,
      status: "pending",
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      notes: args.notes,
      scheduledDate: args.scheduledDate,
    });

    return { pickupId };
  },
});

// Cancel a pending pickup
export const cancelPickup = mutation({
  args: { pickupId: v.id("pickupRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pickup = await ctx.db.get(args.pickupId);
    if (!pickup) throw new Error("Pickup not found");
    if (pickup.citizenId !== userId) throw new Error("Unauthorized");
    if (pickup.status !== "pending") throw new Error("Can only cancel pending pickups");

    await ctx.db.patch(args.pickupId, {
      status: "cancelled",
    });
  },
});

// Get user's pickup requests
export const getUserPickups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("pickupRequests")
      .withIndex("citizenId", (q) => q.eq("citizenId", userId))
      .order("desc")
      .collect();
  },
});

// Get pending pickups for collectors
export const getPendingPickups = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pickupRequests")
      .withIndex("status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// Get collector's assigned pickups
export const getCollectorPickups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("pickupRequests")
      .withIndex("collectorId", (q) => q.eq("collectorId", userId))
      .order("desc")
      .collect();
  },
});

// Accept pickup request (collector)
export const acceptPickup = mutation({
  args: { pickupId: v.id("pickupRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (user?.role !== "collector") throw new Error("Only collectors can accept pickups");

    const pickup = await ctx.db.get(args.pickupId);
    if (!pickup) throw new Error("Pickup not found");
    if (pickup.status !== "pending") throw new Error("Pickup is not available");

    await ctx.db.patch(args.pickupId, {
      collectorId: userId,
      status: "accepted",
    });
  },
});

// Complete pickup and award points
export const completePickup = mutation({
  args: {
    pickupId: v.id("pickupRequests"),
    actualWeight: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pickup = await ctx.db.get(args.pickupId);
    if (!pickup) throw new Error("Pickup not found");
    if (pickup.collectorId !== userId) throw new Error("Unauthorized");

    // Calculate EcoPoints (10 points per kg)
    const ecoPoints = Math.floor(args.actualWeight * 10);
    const txHash = `0x${Math.random().toString(36).substring(2, 15)}`;

    // Update pickup
    await ctx.db.patch(args.pickupId, {
      actualWeight: args.actualWeight,
      status: "completed",
      completedDate: Date.now(),
      ecoPointsEarned: ecoPoints,
      blockchainTxHash: txHash,
    });

    // Award points to citizen
    const citizen = await ctx.db.get(pickup.citizenId);
    if (citizen) {
      await ctx.db.patch(pickup.citizenId, {
        ecoPoints: (citizen.ecoPoints || 0) + ecoPoints,
      });
    }

    // Update collector stats
    const collector = await ctx.db.get(userId);
    if (collector) {
      await ctx.db.patch(userId, {
        totalCollections: (collector.totalCollections || 0) + 1,
      });
    }

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: pickup.citizenId,
      type: "earn",
      amount: ecoPoints,
      description: `Recycled ${args.actualWeight}kg of ${pickup.materialType}`,
      pickupRequestId: args.pickupId,
      blockchainTxHash: txHash,
    });

    return { ecoPoints, txHash };
  },
});

// Rate citizen (by collector)
export const rateCitizen = mutation({
  args: {
    pickupId: v.id("pickupRequests"),
    rating: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pickup = await ctx.db.get(args.pickupId);
    if (!pickup) throw new Error("Pickup not found");
    if (pickup.collectorId !== userId) throw new Error("Unauthorized");
    if (pickup.status !== "completed") throw new Error("Can only rate completed pickups");

    await ctx.db.patch(args.pickupId, {
      citizenRating: args.rating,
      citizenFeedback: args.feedback,
    });
  },
});

// Rate collector (by citizen)
export const rateCollector = mutation({
  args: {
    pickupId: v.id("pickupRequests"),
    rating: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pickup = await ctx.db.get(args.pickupId);
    if (!pickup) throw new Error("Pickup not found");
    if (pickup.citizenId !== userId) throw new Error("Unauthorized");
    if (pickup.status !== "completed") throw new Error("Can only rate completed pickups");

    await ctx.db.patch(args.pickupId, {
      collectorRating: args.rating,
      collectorFeedback: args.feedback,
    });

    // Update collector's average rating
    if (pickup.collectorId) {
      const allRatings = await ctx.db
        .query("pickupRequests")
        .withIndex("collectorId", (q) => q.eq("collectorId", pickup.collectorId!))
        .filter((q) => q.neq(q.field("collectorRating"), undefined))
        .collect();

      const avgRating = allRatings.reduce((sum, p) => sum + (p.collectorRating || 0), 0) / allRatings.length;

      await ctx.db.patch(pickup.collectorId, {
        rating: avgRating,
      });
    }
  },
});

// Toggle collector availability
export const toggleAvailability = mutation({
  args: { isAvailable: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (user?.role !== "collector") throw new Error("Only collectors can set availability");

    await ctx.db.patch(userId, {
      isVerified: args.isAvailable,
    });
  },
});