import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Employers table
export const employers = pgTable("employers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  domain: text("domain"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertEmployerSchema = createInsertSchema(employers).pick({
  name: true,
  website: true,
  domain: true
});

export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type Employer = typeof employers.$inferSelect;

// Job listings table
export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  employerId: integer("employer_id").notNull(),
  platform: text("platform").notNull(), // LinkedIn, Indeed, etc.
  jobUrl: text("job_url").notNull(),
  platformJobId: text("platform_job_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertJobListingSchema = createInsertSchema(jobListings).pick({
  title: true,
  employerId: true,
  platform: true,
  jobUrl: true,
  platformJobId: true
});

export type InsertJobListing = z.infer<typeof insertJobListingSchema>;
export type JobListing = typeof jobListings.$inferSelect;

// Ghosting reports table
export enum GhostingStage {
  APPLICATION = "application",
  SCREENING = "screening",
  INTERVIEW = "interview",
  ASSESSMENT = "assessment",
  OFFER = "offer"
}

export const ghostingReports = pgTable("ghosting_reports", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  jobListingId: integer("job_listing_id"),
  submitterId: text("submitter_id").notNull(), // Anonymous ID for the submitter
  stage: text("stage").notNull(), // When the ghosting occurred (application, interview, etc)
  details: text("details"),
  shareContact: boolean("share_contact").default(false),
  date: timestamp("date").notNull(), // When the ghosting occurred
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertGhostingReportSchema = createInsertSchema(ghostingReports).pick({
  employerId: true,
  jobListingId: true,
  submitterId: true,
  stage: true,
  details: true,
  shareContact: true,
  date: true
});

export type InsertGhostingReport = z.infer<typeof insertGhostingReportSchema>;
export type GhostingReport = typeof ghostingReports.$inferSelect;

// Extended types with additional data
export type GhostingReportWithDetails = GhostingReport & {
  employer: Employer;
  jobListing?: JobListing;
};

export type EmployerWithStats = Employer & {
  reportCount: number;
  averageRating: number;
};

export type JobListingWithStats = JobListing & {
  employer: Employer;
  reportCount: number;
  applicantCount: number;
  ghostingScore: number;
  rating: string;
};
