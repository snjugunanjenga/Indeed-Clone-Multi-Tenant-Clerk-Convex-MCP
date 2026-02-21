"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Bookmark, BookmarkCheck, Briefcase, MapPin, Send } from "lucide-react";

function formatSalary(min?: number, max?: number, currency?: string) {
  if (min === undefined && max === undefined) return "Salary not listed";
  const unit = currency ?? "USD";
  if (min !== undefined && max !== undefined) return `${min.toLocaleString()} – ${max.toLocaleString()} ${unit}`;
  return `${(max ?? min ?? 0).toLocaleString()} ${unit}`;
}

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId as Id<"jobListings">;
  const [coverLetter, setCoverLetter] = useState("");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = useQuery(api.jobs.getJobListingById, { jobId });
  const isFavorited = useQuery(api.favorites.isJobFavorited, { jobId });
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const applyToJob = useMutation(api.applications.applyToJob);

  if (job === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-secondary" />
        <div className="h-64 animate-pulse rounded-2xl bg-secondary" />
      </div>
    );
  }

  if (!job) {
    return (
      <Card className="warm-shadow">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="font-medium">This job is no longer available</p>
          <p className="text-sm text-muted-foreground">
            It may have been closed or removed by the employer.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/jobs">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to jobs
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="animate-fade-in space-y-6">
      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to all jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Job details */}
        <Card className="warm-shadow">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 rounded-full">
                <Briefcase className="size-3" />
                {job.employmentType.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {job.workplaceType.replace("_", " ")}
              </Badge>
            </div>
            <CardTitle className="font-[family-name:var(--font-bricolage)] text-2xl tracking-tight">
              {job.title}
            </CardTitle>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {job.companyName}
              <span className="text-border">·</span>
              <MapPin className="size-3" />
              {job.location}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="font-[family-name:var(--font-bricolage)] text-lg font-semibold">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>

            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {job.description}
              </p>
            </div>

            {(job.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(job.tags ?? []).slice(0, 8).map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/jobs">
                  <ArrowLeft className="mr-1 size-3" />
                  All jobs
                </Link>
              </Button>
              <Button
                variant={isFavorited ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => {
                  if (isFavorited) {
                    void removeFavorite({ jobId });
                  } else {
                    void addFavorite({ jobId });
                  }
                }}
              >
                {isFavorited ? (
                  <>
                    <BookmarkCheck className="mr-1 size-3.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-1 size-3.5" />
                    Save this job
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Apply form */}
        <Card className="warm-shadow h-fit lg:sticky lg:top-28">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-bricolage)] text-xl tracking-tight">
              Apply now
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Submit your application directly — it only takes a minute.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover letter</Label>
              <Textarea
                id="coverLetter"
                rows={8}
                placeholder="Tell them why you're a great fit for this role..."
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional, but a short note can make a difference.
              </p>
            </div>
            <Button
              className="w-full rounded-xl bg-terracotta text-white hover:bg-terracotta/90"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                setStatusText(null);
                try {
                  await applyToJob({
                    jobId,
                    coverLetter: coverLetter.trim() || undefined,
                  });
                  setStatusText("Application submitted successfully!");
                  setCoverLetter("");
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Could not submit application.";
                  setStatusText(message);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <Send className="mr-1.5 size-4" />
              {isSubmitting ? "Submitting..." : "Submit application"}
            </Button>
            {statusText && (
              <p className={`text-xs ${statusText.includes("success") ? "text-jade" : "text-muted-foreground"}`}>
                {statusText}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
