import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateViewerUser, getViewerUser } from "./lib/auth";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getViewerUser(ctx);
    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return { user, profile, resumes };
  },
});

export const upsertMyProfile = mutation({
  args: {
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    yearsExperience: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    openToWork: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const now = Date.now();
    const normalizedSkills = (args.skills ?? [])
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!existing) {
      const profileId = await ctx.db.insert("profiles", {
        userId: user._id,
        headline: args.headline,
        bio: args.bio,
        location: args.location,
        yearsExperience: args.yearsExperience,
        skills: normalizedSkills,
        openToWork: args.openToWork ?? true,
        updatedAt: now,
      });
      return await ctx.db.get(profileId);
    }

    await ctx.db.patch(existing._id, {
      headline: args.headline ?? undefined,
      bio: args.bio ?? undefined,
      location: args.location ?? undefined,
      yearsExperience: args.yearsExperience ?? undefined,
      skills: normalizedSkills.length > 0 ? normalizedSkills : existing.skills,
      openToWork: args.openToWork ?? undefined,
      updatedAt: now,
    });

    return await ctx.db.get(existing._id);
  },
});

export const saveResume = mutation({
  args: {
    resumeId: v.optional(v.id("resumes")),
    title: v.string(),
    fileUrl: v.string(),
    fileName: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const now = Date.now();
    const setAsDefault = args.isDefault ?? false;

    if (setAsDefault) {
      const existingDefaults = await ctx.db
        .query("resumes")
        .withIndex("by_userId_isDefault", (q) =>
          q.eq("userId", user._id).eq("isDefault", true),
        )
        .collect();

      await Promise.all(
        existingDefaults.map((resume) =>
          ctx.db.patch(resume._id, {
            isDefault: false,
            updatedAt: now,
          }),
        ),
      );
    }

    if (args.resumeId) {
      const existing = await ctx.db.get(args.resumeId);
      if (!existing || existing.userId !== user._id) {
        throw new ConvexError("Resume not found.");
      }

      await ctx.db.patch(args.resumeId, {
        title: args.title,
        fileUrl: args.fileUrl,
        fileName: args.fileName,
        isDefault: setAsDefault,
        updatedAt: now,
      });
      return await ctx.db.get(args.resumeId);
    }

    const resumeId = await ctx.db.insert("resumes", {
      userId: user._id,
      title: args.title,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      isDefault: setAsDefault,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(resumeId);
  },
});

export const deleteResume = mutation({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.resumeId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("Resume not found.");
    }

    await ctx.db.delete(args.resumeId);

    if (existing.isDefault) {
      const replacement = await ctx.db
        .query("resumes")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .order("desc")
        .first();

      if (replacement) {
        await ctx.db.patch(replacement._id, {
          isDefault: true,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
