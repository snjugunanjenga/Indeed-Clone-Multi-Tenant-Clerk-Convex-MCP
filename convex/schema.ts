import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  profiles: defineTable({
    userId: v.id("users"),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    yearsExperience: v.optional(v.number()),
    skills: v.array(v.string()),
    openToWork: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  resumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    fileUrl: v.string(),
    fileName: v.string(),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isDefault", ["userId", "isDefault"]),

  companies: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    createdByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkOrgId", ["clerkOrgId"])
    .index("by_slug", ["slug"]),

  companyMembers: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("recruiter"),
      v.literal("member"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("suspended"),
      v.literal("removed"),
    ),
    joinedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_companyId", ["companyId"])
    .index("by_userId", ["userId"])
    .index("by_companyId_userId", ["companyId", "userId"])
    .index("by_clerkOrgId_clerkUserId", ["clerkOrgId", "clerkUserId"]),

  jobListings: defineTable({
    companyId: v.id("companies"),
    companyName: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    employmentType: v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("contract"),
      v.literal("internship"),
      v.literal("temporary"),
    ),
    workplaceType: v.union(
      v.literal("on_site"),
      v.literal("remote"),
      v.literal("hybrid"),
    ),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    tags: v.array(v.string()),
    searchText: v.string(),
    isActive: v.boolean(),
    featured: v.boolean(),
    applicationCount: v.number(),
    postedByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
  })
    .index("by_companyId", ["companyId"])
    .index("by_companyId_isActive", ["companyId", "isActive"])
    .index("by_isActive_createdAt", ["isActive", "createdAt"])
    .index("by_workplaceType", ["workplaceType"])
    .index("by_employmentType", ["employmentType"])
    .searchIndex("search_jobs", {
      searchField: "searchText",
      filterFields: ["isActive", "companyId", "workplaceType", "employmentType"],
    }),

  applications: defineTable({
    jobId: v.id("jobListings"),
    companyId: v.id("companies"),
    applicantUserId: v.id("users"),
    status: v.union(
      v.literal("submitted"),
      v.literal("in_review"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn"),
    ),
    coverLetter: v.optional(v.string()),
    resumeId: v.optional(v.id("resumes")),
    answers: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
    decidedByUserId: v.optional(v.id("users")),
    decidedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_applicantUserId_createdAt", ["applicantUserId", "createdAt"])
    .index("by_jobId_createdAt", ["jobId", "createdAt"])
    .index("by_companyId_status", ["companyId", "status"])
    .index("by_companyId_createdAt", ["companyId", "createdAt"])
    .index("by_jobId_applicantUserId", ["jobId", "applicantUserId"]),

  favorites: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobListings"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_jobId", ["userId", "jobId"])
    .index("by_jobId", ["jobId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("application_status"),
      v.literal("application_received"),
      v.literal("system"),
    ),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_userId_isRead_createdAt", ["userId", "isRead", "createdAt"]),
});
