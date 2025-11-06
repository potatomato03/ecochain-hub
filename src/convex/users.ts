import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const setUserRole = mutation({
  args: {
    role: v.union(v.literal("citizen"), v.literal("collector")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    
    // Only set role if not already set or if explicitly changing
    await ctx.db.patch(userId, {
      role: args.role,
      ecoPoints: args.role === "citizen" ? (user?.ecoPoints || 0) : undefined,
      totalCollections: args.role === "collector" ? (user?.totalCollections || 0) : undefined,
      rating: args.role === "collector" ? (user?.rating || 0) : undefined,
    });

    return { success: true, role: args.role };
  },
});