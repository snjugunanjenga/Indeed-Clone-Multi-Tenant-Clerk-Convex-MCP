"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Bookmark, BookmarkCheck, MapPin, Search, Briefcase } from "lucide-react";

type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "temporary";
type WorkplaceType = "on_site" | "remote" | "hybrid";

function formatSalary(min?: number, max?: number, currency?: string) {
  if (min === undefined && max === undefined) return "Salary not listed";
  const unit = currency ?? "USD";
  if (min !== undefined && max !== undefined) return `${min.toLocaleString()} – ${max.toLocaleString()} ${unit}`;
  return `${(max ?? min ?? 0).toLocaleString()} ${unit}`;
}

export default function JobsPage() {
  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState("");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | "">("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");

  const jobs = useQuery(api.jobs.searchJobListings, {
    searchText: searchText.trim() || undefined,
    location: location.trim() || undefined,
    workplaceType: workplaceType || undefined,
    employmentType: employmentType || undefined,
    limit: 30,
  });
  const favorites = useQuery(api.favorites.listMyFavorites, { limit: 200 });
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [pendingFavoriteJobId, setPendingFavoriteJobId] = useState<string | null>(null);

  const favoriteJobIds = useMemo(
    () => new Set((favorites ?? []).map((item) => item.job?._id).filter(Boolean)),
    [favorites],
  );

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
          Find your next role
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search openings by title, location, or type — then save the ones you like.
        </p>
      </div>

      {/* Filter bar */}
      <Card className="warm-shadow">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Title, company, or skill"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none"
              value={workplaceType}
              onChange={(event) => setWorkplaceType(event.target.value as WorkplaceType | "")}
            >
              <option value="">Any workplace</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on_site">On-site</option>
            </select>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none"
              value={employmentType}
              onChange={(event) => setEmploymentType(event.target.value as EmploymentType | "")}
            >
              <option value="">Any type</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Status feedback */}
      {statusText && (
        <p className="text-xs text-muted-foreground">{statusText}</p>
      )}

      {/* Results */}
      <div className="space-y-3">
        {jobs === undefined && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        )}

        {jobs?.length === 0 && (
          <Card className="warm-shadow">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <p className="font-medium">No jobs match your filters</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try broadening your search or removing some filters to see more results.
              </p>
            </CardContent>
          </Card>
        )}

        {jobs?.map((job, index) => {
          const isFavorite = favoriteJobIds.has(job._id);
          return (
            <Card
              key={job._id}
              className="animate-slide-up warm-shadow group transition-all hover:warm-shadow-md"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-[family-name:var(--font-bricolage)] text-lg tracking-tight">
                      <Link
                        href={`/jobs/${job._id}`}
                        className="hover:text-terracotta transition-colors"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      {job.companyName}
                      <span className="text-border">·</span>
                      <MapPin className="size-3" />
                      {job.location}
                    </p>
                  </div>
                  <button
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isFavorite
                        ? "bg-terracotta/10 text-terracotta"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                    disabled={pendingFavoriteJobId === job._id}
                    onClick={async () => {
                      setStatusText(null);
                      setPendingFavoriteJobId(job._id);
                      try {
                        if (isFavorite) {
                          await removeFavorite({ jobId: job._id });
                          setStatusText("Removed from saved jobs.");
                        } else {
                          await addFavorite({ jobId: job._id });
                          setStatusText("Saved to your favorites.");
                        }
                      } catch (error) {
                        setStatusText(
                          error instanceof Error ? error.message : "Could not update saved jobs.",
                        );
                      } finally {
                        setPendingFavoriteJobId(null);
                      }
                    }}
                    aria-label={isFavorite ? "Remove from saved" : "Save job"}
                  >
                    {isFavorite ? (
                      <BookmarkCheck className="size-4" />
                    ) : (
                      <Bookmark className="size-4" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {job.description}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="gap-1 rounded-full text-xs"
                  >
                    <Briefcase className="size-3" />
                    {job.employmentType.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {job.workplaceType.replace("_", " ")}
                  </Badge>
                  <span className="ml-auto text-sm font-medium">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </span>
                </div>
                <div className="pt-1">
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-terracotta text-white hover:bg-terracotta/90"
                  >
                    <Link href={`/jobs/${job._id}`}>
                      View details
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
