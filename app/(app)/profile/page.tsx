"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, FileText, Plus, Save, Trash2 } from "lucide-react";

type ProfileFormValues = {
  headline: string;
  bio: string;
  location: string;
  yearsExperience: string;
  skills: string;
  openToWork: boolean;
};

export default function ProfilePage() {
  const profileBundle = useQuery(api.profiles.getMyProfile, {});
  const upsertMyProfile = useMutation(api.profiles.upsertMyProfile);
  const saveResume = useMutation(api.profiles.saveResume);
  const deleteResume = useMutation(api.profiles.deleteResume);
  const [statusText, setStatusText] = useState<string | null>(null);

  const [resumeTitle, setResumeTitle] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeFileUrl, setResumeFileUrl] = useState("");

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      headline: "",
      bio: "",
      location: "",
      yearsExperience: "",
      skills: "",
      openToWork: true,
    },
  });

  useEffect(() => {
    form.reset({
      headline: profileBundle?.profile?.headline ?? "",
      bio: profileBundle?.profile?.bio ?? "",
      location: profileBundle?.profile?.location ?? "",
      yearsExperience:
        profileBundle?.profile?.yearsExperience !== undefined
          ? String(profileBundle.profile.yearsExperience)
          : "",
      skills: (profileBundle?.profile?.skills ?? []).join(", "),
      openToWork: profileBundle?.profile?.openToWork ?? true,
    });
  }, [form, profileBundle]);

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete profile helps companies understand your background when you apply.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Profile form */}
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-bricolage)] text-xl tracking-tight">
              About you
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  setStatusText(null);
                  const years = values.yearsExperience?.trim() ?? "";
                  const skillsValue = values.skills ?? "";
                  if (years && Number.isNaN(Number(years))) {
                    setStatusText("Years of experience must be a number.");
                    return;
                  }

                  try {
                    await upsertMyProfile({
                      headline: values.headline?.trim() || undefined,
                      bio: values.bio?.trim() || undefined,
                      location: values.location?.trim() || undefined,
                      yearsExperience: years ? Number(years) : undefined,
                      skills: skillsValue
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean),
                      openToWork: values.openToWork ?? true,
                    });
                    setStatusText("Profile saved successfully.");
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "Could not save profile.";
                    setStatusText(message);
                  }
                })}
              >
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Frontend Engineer" {...field} />
                      </FormControl>
                      <FormDescription>A short title that describes what you do.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Tell companies about your background and what you're looking for..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of experience</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" placeholder="e.g. 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="React, TypeScript, Product design" {...field} />
                      </FormControl>
                      <FormDescription>
                        Separate skills with commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openToWork"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                      </FormControl>
                      <div>
                        <FormLabel>Open to work</FormLabel>
                        <FormDescription>Let recruiters know you&apos;re available.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    className="rounded-full bg-terracotta text-white hover:bg-terracotta/90"
                  >
                    <Save className="mr-1.5 size-3.5" />
                    Save profile
                  </Button>
                  {statusText && (
                    <p className={`text-xs ${statusText.includes("success") ? "text-jade" : "text-muted-foreground"}`}>
                      {statusText}
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Resumes */}
        <div className="space-y-6">
          <Card className="warm-shadow">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-bricolage)] text-xl tracking-tight">
                Resumes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Link your resume files so they&apos;re ready when you apply.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="resumeTitle" className="text-xs text-muted-foreground">
                    Resume title
                  </Label>
                  <Input
                    id="resumeTitle"
                    value={resumeTitle}
                    onChange={(event) => setResumeTitle(event.target.value)}
                    placeholder="e.g. Primary resume"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="resumeFileName" className="text-xs text-muted-foreground">
                    File name
                  </Label>
                  <Input
                    id="resumeFileName"
                    value={resumeFileName}
                    onChange={(event) => setResumeFileName(event.target.value)}
                    placeholder="resume.pdf"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="resumeFileUrl" className="text-xs text-muted-foreground">
                    File URL
                  </Label>
                  <Input
                    id="resumeFileUrl"
                    value={resumeFileUrl}
                    onChange={(event) => setResumeFileUrl(event.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={async () => {
                  if (!resumeTitle || !resumeFileName || !resumeFileUrl) return;
                  await saveResume({
                    title: resumeTitle,
                    fileName: resumeFileName,
                    fileUrl: resumeFileUrl,
                    isDefault: (profileBundle?.resumes.length ?? 0) === 0,
                  });
                  setResumeTitle("");
                  setResumeFileName("");
                  setResumeFileUrl("");
                }}
              >
                <Plus className="mr-1.5 size-3.5" />
                Add resume
              </Button>

              {/* Existing resumes */}
              {(profileBundle?.resumes ?? []).length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  {(profileBundle?.resumes ?? []).map((resume) => (
                    <div
                      key={resume._id}
                      className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                          <FileText className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{resume.title}</p>
                          <p className="text-xs text-muted-foreground">{resume.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button asChild size="sm" variant="ghost" className="size-8 rounded-full p-0">
                          <a href={resume.fileUrl} target="_blank" rel="noreferrer" aria-label="Open resume">
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-8 rounded-full p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => void deleteResume({ resumeId: resume._id })}
                          aria-label="Delete resume"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
