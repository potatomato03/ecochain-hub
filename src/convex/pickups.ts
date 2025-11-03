import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Create a new pickup request and auto-complete it
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

    // Use estimated weight as actual weight for auto-completion
    const actualWeight = args.estimatedWeight;
    
    // Calculate EcoPoints (10 points per kg)
    const ecoPoints = Math.floor(actualWeight * 10);
    const txHash = `0x${Math.random().toString(36).substring(2, 15)}`;

    // Create pickup request as completed
    const pickupId = await ctx.db.insert("pickupRequests", {
      citizenId: userId,
      materialType: args.materialType as any,
      estimatedWeight: args.estimatedWeight,
      actualWeight: actualWeight,
      status: "completed",
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      notes: args.notes,
      scheduledDate: args.scheduledDate,
      completedDate: Date.now(),
      ecoPointsEarned: ecoPoints,
      blockchainTxHash: txHash,
    });

    // Award points to citizen
    const citizen = await ctx.db.get(userId);
    if (citizen) {
      await ctx.db.patch(userId, {
        ecoPoints: (citizen.ecoPoints || 0) + ecoPoints,
      });
    }

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: userId,
      type: "earn",
      amount: ecoPoints,
      description: `Recycled ${actualWeight}kg of ${args.materialType}`,
      pickupRequestId: pickupId,
      blockchainTxHash: txHash,
    });

    return { pickupId, ecoPoints, txHash };
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

// Accept pickup request (collector)
export const acceptPickup = mutation({
  args: { pickupId: v.id("pickupRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

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