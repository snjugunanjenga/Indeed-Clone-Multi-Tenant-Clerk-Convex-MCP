import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getOrCreateViewerUser, requireViewerUser } from "./lib/auth";
import { requireCompany, requireCompanyRole } from "./lib/companies";

const employmentTypeValidator = v.union(
  v.literal("full_time"),
  v.literal("part_time"),
  v.literal("contract"),
  v.literal("internship"),
  v.literal("temporary"),
);

const workplaceTypeValidator = v.union(
  v.literal("on_site"),
  v.literal("remote"),
  v.literal("hybrid"),
);

function buildSearchText(input: {
  title: string;
  description: string;
  location: string;
  companyName: string;
  tags: string[];
}) {
  return [
    input.title,
    input.description,
    input.location,
    input.companyName,
    input.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function normalizeTags(tags?: string[]) {
  return (tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}

function applyInMemoryFilters(
  jobs: Doc<"jobListings">[],
  filters: {
    location?: string;
    minSalary?: number;
    tags?: string[];
  },
) {
  const requiredTags = normalizeTags(filters.tags);
  return jobs.filter((job) => {
    const matchesLocation = filters.location
      ? job.location.toLowerCase().includes(filters.location.toLowerCase())
      : true;

    const matchesSalary =
      filters.minSalary !== undefined
        ? (job.salaryMax ?? job.salaryMin ?? 0) >= filters.minSalary
        : true;

    const matchesTags =
      requiredTags.length === 0
        ? true
        : requiredTags.every((tag) => job.tags.includes(tag));

    return matchesLocation && matchesSalary && matchesTags;
  });
}

export const createJobListing = mutation({
  args: {
    companyId: v.id("companies"),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    employmentType: employmentTypeValidator,
    workplaceType: workplaceTypeValidator,
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    autoCloseOnAccept: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const company = await requireCompany(args.companyId, ctx);
    await requireCompanyRole(ctx, args.companyId, user._id, ["admin", "recruiter"]);

    if (
      args.salaryMin !== undefined &&
      args.salaryMax !== undefined &&
      args.salaryMin > args.salaryMax
    ) {
      throw new ConvexError("salaryMin cannot be greater than salaryMax.");
    }

    const tags = normalizeTags(args.tags);
    const now = Date.now();

    return await ctx.db.insert("jobListings", {
      companyId: args.companyId,
      companyName: company.name,
      title: args.title,
      description: args.description,
      location: args.location,
      employmentType: args.employmentType,
      workplaceType: args.workplaceType,
      salaryMin: args.salaryMin,
      salaryMax: args.salaryMax,
      salaryCurrency: args.salaryCurrency,
      tags,
      searchText: buildSearchText({
        title: args.title,
        description: args.description,
        location: args.location,
        companyName: company.name,
        tags,
      }),
      isActive: true,
      featured: args.featured ?? false,
      autoCloseOnAccept: args.autoCloseOnAccept ?? false,
      applicationCount: 0,
      postedByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getJobListingById = query({
  args: {
    jobId: v.id("jobListings"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

export const listRecentJobs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100));
    return await ctx.db
      .query("jobListings")
      .withIndex("by_isActive_createdAt", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);
  },
});

export const searchJobListings = query({
  args: {
    searchText: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    location: v.optional(v.string()),
    workplaceType: v.optional(workplaceTypeValidator),
    employmentType: v.optional(employmentTypeValidator),
    minSalary: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    includeClosed: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const includeClosed = args.includeClosed ?? false;
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100));
    const text = args.searchText?.trim().toLowerCase();

    let rows: Doc<"jobListings">[] = [];
    if (text) {
      const searchQuery = ctx.db
        .query("jobListings")
        .withSearchIndex("search_jobs", (q) => {
          let scoped = q.search("searchText", text);
          if (args.companyId) scoped = scoped.eq("companyId", args.companyId);
          if (args.workplaceType) scoped = scoped.eq("workplaceType", args.workplaceType);
          if (args.employmentType) scoped = scoped.eq("employmentType", args.employmentType);
          return scoped;
        });

      rows = await searchQuery.take(limit * 4);
    } else if (args.companyId) {
      const companyId = args.companyId;
      if (includeClosed) {
        rows = await ctx.db
          .query("jobListings")
          .withIndex("by_companyId", (q) => q.eq("companyId", companyId))
          .order("desc")
          .take(limit * 4);
      } else {
        rows = await ctx.db
          .query("jobListings")
          .withIndex("by_companyId_isActive", (q) =>
            q.eq("companyId", companyId).eq("isActive", true),
          )
          .order("desc")
          .take(limit * 4);
      }
    } else {
      rows = await ctx.db
        .query("jobListings")
        .withIndex("by_isActive_createdAt", (q) => q.eq("isActive", true))
        .order("desc")
        .take(limit * 4);
    }

    const statusFiltered = includeClosed ? rows : rows.filter((job) => job.isActive);
    const uniqueRows = Array.from(
      new Map(statusFiltered.map((row) => [row._id, row])).values(),
    );
    const locationFiltered = applyInMemoryFilters(uniqueRows, {
      location: args.location,
      minSalary: args.minSalary,
      tags: args.tags,
    });

    return locationFiltered.slice(0, limit);
  },
});

export const listCompanyJobs = query({
  args: {
    companyId: v.id("companies"),
    includeClosed: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerUser(ctx);
    await requireCompanyRole(ctx, args.companyId, user._id, [
      "admin",
      "recruiter",
      "member",
    ]);

    const limit = Math.max(1, Math.min(args.limit ?? 50, 200));
    if (args.includeClosed) {
      return await ctx.db
        .query("jobListings")
        .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("jobListings")
      .withIndex("by_companyId_isActive", (q) =>
        q.eq("companyId", args.companyId).eq("isActive", true),
      )
      .order("desc")
      .take(limit);
  },
});

export const updateJobListing = mutation({
  args: {
    companyId: v.id("companies"),
    jobId: v.id("jobListings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    employmentType: v.optional(employmentTypeValidator),
    workplaceType: v.optional(workplaceTypeValidator),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    autoCloseOnAccept: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    await requireCompanyRole(ctx, args.companyId, user._id, ["admin", "recruiter"]);

    const existing = await ctx.db.get(args.jobId);
    if (!existing || existing.companyId !== args.companyId) {
      throw new ConvexError("Job listing was not found for this company.");
    }

    if (
      args.salaryMin !== undefined &&
      args.salaryMax !== undefined &&
      args.salaryMin > args.salaryMax
    ) {
      throw new ConvexError("salaryMin cannot be greater than salaryMax.");
    }

    const tags = args.tags ? normalizeTags(args.tags) : existing.tags;
    const title = args.title ?? existing.title;
    const description = args.description ?? existing.description;
    const location = args.location ?? existing.location;
    const company = await requireCompany(args.companyId, ctx);
    const now = Date.now();

    await ctx.db.patch(args.jobId, {
      title: args.title ?? undefined,
      description: args.description ?? undefined,
      location: args.location ?? undefined,
      employmentType: args.employmentType ?? undefined,
      workplaceType: args.workplaceType ?? undefined,
      salaryMin: args.salaryMin ?? undefined,
      salaryMax: args.salaryMax ?? undefined,
      salaryCurrency: args.salaryCurrency ?? undefined,
      tags,
      featured: args.featured ?? undefined,
      autoCloseOnAccept: args.autoCloseOnAccept ?? undefined,
      isActive: args.isActive ?? undefined,
      searchText: buildSearchText({
        title,
        description,
        location,
        companyName: company.name,
        tags,
      }),
      updatedAt: now,
      closedAt: args.isActive === false ? now : existing.closedAt,
    });

    return await ctx.db.get(args.jobId);
  },
});

export const closeJobListing = mutation({
  args: {
    companyId: v.id("companies"),
    jobId: v.id("jobListings"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    await requireCompanyRole(ctx, args.companyId, user._id, ["admin", "recruiter"]);

    const existing = await ctx.db.get(args.jobId);
    if (!existing || existing.companyId !== args.companyId) {
      throw new ConvexError("Job listing was not found for this company.");
    }

    const now = Date.now();
    await ctx.db.patch(args.jobId, {
      isActive: false,
      closedAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(args.jobId);
  },
});
