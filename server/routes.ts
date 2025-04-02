import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { insertCompanySchema, insertGhostingReportSchema, jobDetailsSchema, ghostingReports } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });
  
  // Create a company
  app.post("/api/companies", async (req: Request, res: Response) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error creating company:", error);
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  // Get company stats by name
  app.get("/api/companies/stats", async (req: Request, res: Response) => {
    try {
      const { name } = req.query;
      
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Company name is required" });
      }
      
      const stats = await storage.getCompanyStatsByName(name);
      
      if (!stats) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting company stats:", error);
      res.status(500).json({ error: "Failed to get company stats" });
    }
  });

  // Get company stats by URL
  app.get("/api/url/stats", async (req: Request, res: Response) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }
      
      const stats = await storage.getCompanyStatsForUrl(url);
      
      if (!stats) {
        return res.status(404).json({ error: "No data for this URL" });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting URL stats:", error);
      res.status(500).json({ error: "Failed to get URL stats" });
    }
  });

  // Create a new ghosting report
  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      // Need to transform the data to match our schema requirements
      const transformedData = {
        companyId: 0, // Placeholder, will be replaced
        jobTitle: req.body.positionTitle || req.body.jobTitle,
        jobBoard: req.body.jobBoard,
        jobUrl: req.body.jobPost || req.body.jobUrl,
        applicationStage: req.body.stage || req.body.applicationStage,
        incidentDate: req.body.incidentDate ? new Date(req.body.incidentDate) : new Date(), // Use current date if not provided
        details: req.body.details,
        anonymous: req.body.anonymous !== false, // Default to true
        reporterId: req.body.reporterId
      };
      
      // Check if company exists, create if not
      let company = await storage.getCompanyByName(req.body.companyName);
      
      if (!company) {
        company = await storage.createCompany({ 
          name: req.body.companyName,
          website: req.body.companyWebsite
        });
      }
      
      // Now validate with the schema
      const reportData = insertGhostingReportSchema.parse({
        ...transformedData,
        companyId: company.id
      });
      
      // Create the report
      const report = await storage.createGhostingReport(reportData);
      
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error creating ghosting report:", error);
      res.status(500).json({ error: "Failed to create ghosting report" });
    }
  });

  // Get company reports
  app.get("/api/companies/:id/reports", async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.params.id);
      
      if (isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const reports = await storage.getCompanyReports(companyId);
      res.json(reports);
    } catch (error) {
      console.error("Error getting company reports:", error);
      res.status(500).json({ error: "Failed to get company reports" });
    }
  });

  // Get all reports for a specific reporter
  app.get("/api/reporters/:id/reports", async (req: Request, res: Response) => {
    try {
      const reporterId = req.params.id;
      
      if (!reporterId) {
        return res.status(400).json({ error: "Reporter ID is required" });
      }
      
      // Query the database directly for reports by reporter ID
      const reports = await db
        .select()
        .from(ghostingReports)
        .where(eq(ghostingReports.reporterId, reporterId));
      
      res.json(reports);
    } catch (error) {
      console.error("Error getting reporter reports:", error);
      res.status(500).json({ error: "Failed to get reporter reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
