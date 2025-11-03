import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const redeemPoints = mutation({
  args: {
    storeId: v.id("partnerStores"),
    ecoPointsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || (user.ecoPoints || 0) < args.ecoPointsUsed) {
      throw new Error("Insufficient EcoPoints");
    }

    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");

    const valueRedeemed = args.ecoPointsUsed / store.redemptionRate;
    const qrCode = `ECO-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Deduct points
    await ctx.db.patch(userId, {
      ecoPoints: (user.ecoPoints || 0) - args.ecoPointsUsed,
    });

    // Create redemption
    const redemptionId = await ctx.db.insert("redemptions", {
      userId,
      storeId: args.storeId,
      ecoPointsUsed: args.ecoPointsUsed,
      valueRedeemed,
      qrCode,
      status: "pending",
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Create transaction
    await ctx.db.insert("transactions", {
      userId,
      type: "redeem",
      amount: -args.ecoPointsUsed,
      description: `Redeemed at ${store.name}`,
    });

    return { redemptionId, qrCode, valueRedeemed };
  },
});

export const getPartnerStores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("partnerStores")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
