import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertGhostingReportSchema, jobDetailsSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
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
      // Validate the job details and report data
      const reportData = insertGhostingReportSchema.parse(req.body);
      
      // Check if company exists, create if not
      let company = await storage.getCompanyByName(req.body.companyName);
      
      if (!company) {
        company = await storage.createCompany({ 
          name: req.body.companyName,
          website: req.body.companyWebsite
        });
      }
      
      // Replace companyName with companyId
      const report = await storage.createGhostingReport({
        ...reportData,
        companyId: company.id
      });
      
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
      
      // In memory storage doesn't have an index so we need to filter
      const allReports = Array.from(
        Object.values(storage as any)
          .find((val: any) => val instanceof Map && val.size > 0 && 
                Array.from(val.values())[0]?.reporterId !== undefined)
          ?.values() || []
      );
      
      const reports = allReports.filter(report => report.reporterId === reporterId);
      res.json(reports);
    } catch (error) {
      console.error("Error getting reporter reports:", error);
      res.status(500).json({ error: "Failed to get reporter reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
