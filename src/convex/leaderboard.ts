import { query } from "./_generated/server";

export const getTopRecyclers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("ecoPoints"), undefined))
      .collect();

    return users
      .sort((a, b) => (b.ecoPoints || 0) - (a.ecoPoints || 0))
      .slice(0, 10)
      .map((user, index) => ({
        rank: index + 1,
        name: user.name || "Anonymous",
        ecoPoints: user.ecoPoints || 0,
        image: user.image,
      }));
  },
});

export const getTopCollectors = query({
  args: {},
  handler: async (ctx) => {
    const collectors = await ctx.db
      .query("users")
      .withIndex("role", (q) => q.eq("role", "collector"))
      .collect();

    return collectors
      .sort((a, b) => (b.totalCollections || 0) - (a.totalCollections || 0))
      .slice(0, 10)
      .map((collector, index) => ({
        rank: index + 1,
        name: collector.name || "Anonymous",
        totalCollections: collector.totalCollections || 0,
        rating: collector.rating || 0,
        image: collector.image,
      }));
  },
});
