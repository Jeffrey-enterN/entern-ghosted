import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define supported job boards
export const JOB_BOARDS = ["linkedin", "indeed", "ziprecruiter", "monster"] as const;
export type JobBoard = typeof JOB_BOARDS[number];

// Define application stages
export const APPLICATION_STAGES = [
  "Initial Application",
  "After Phone Screen",
  "After First Interview",
  "After Multiple Interviews",
  "After Final Round",
  "After Verbal Offer"
] as const;
export type ApplicationStage = typeof APPLICATION_STAGES[number];

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GhostingReports table
export const ghostingReports = pgTable("ghosting_reports", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  jobTitle: text("job_title").notNull(),
  jobBoard: text("job_board").notNull(),
  jobUrl: text("job_url").notNull(),
  applicationStage: text("application_stage").notNull(),
  reportDate: timestamp("report_date").defaultNow().notNull(),
  incidentDate: timestamp("incident_date").notNull(),
  details: text("details"),
  anonymous: boolean("anonymous").default(true),
  reporterId: text("reporter_id").notNull(),
});

// Company schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

// Ghosting report schemas
export const insertGhostingReportSchema = createInsertSchema(ghostingReports)
  .omit({
    id: true,
    reportDate: true,
  })
  .extend({
    applicationStage: z.enum(APPLICATION_STAGES),
    jobBoard: z.enum(JOB_BOARDS),
  });

// Company stats schema (for API responses)
export const companyStatsSchema = z.object({
  id: z.number(),
  name: z.string(),
  ghostingRate: z.number(),
  totalReports: z.number(),
  stageBreakdown: z.record(z.string(), z.number()),
  recentReports: z.array(
    z.object({
      id: z.number(),
      applicationStage: z.string(),
      reportDate: z.string(),
      details: z.string().optional(),
    })
  ),
});

// Job details schema (for content script detection)
export const jobDetailsSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  jobBoard: z.enum(JOB_BOARDS),
  url: z.string().url(),
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type GhostingReport = typeof ghostingReports.$inferSelect;
export type InsertGhostingReport = z.infer<typeof insertGhostingReportSchema>;
export type CompanyStats = z.infer<typeof companyStatsSchema>;
export type JobDetails = z.infer<typeof jobDetailsSchema>;
