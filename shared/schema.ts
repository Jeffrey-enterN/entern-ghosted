import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Companies table to store employer information
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  industry: true,
  website: true,
});

// GhostingReports table to store user submitted reports
export const ghostingReports = pgTable("ghosting_reports", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  jobTitle: text("job_title").notNull(),
  applicationDate: timestamp("application_date").notNull(),
  ghostingStage: text("ghosting_stage").notNull(),
  timeElapsed: text("time_elapsed").notNull(),
  details: text("details"),
  anonymous: boolean("anonymous").default(false),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
  userId: integer("user_id"),
  jobBoard: text("job_board"),
  location: text("location"),
});

export const insertGhostingReportSchema = createInsertSchema(ghostingReports).omit({
  id: true,
  reportedAt: true,
});

// Job Boards table to track supported job boards
export const jobBoards = pgTable("job_boards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  domainPattern: varchar("domain_pattern", { length: 255 }).notNull(),
  enabled: boolean("enabled").default(true),
});

export const insertJobBoardSchema = createInsertSchema(jobBoards).omit({
  id: true,
});

// Types for the models
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type GhostingReport = typeof ghostingReports.$inferSelect;
export type InsertGhostingReport = z.infer<typeof insertGhostingReportSchema>;

export type JobBoard = typeof jobBoards.$inferSelect;
export type InsertJobBoard = z.infer<typeof insertJobBoardSchema>;
