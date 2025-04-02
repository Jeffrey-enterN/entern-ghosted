import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGhostingReportSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - prefix all with /api
  
  // Get all job boards
  app.get("/api/job-boards", async (req: Request, res: Response) => {
    try {
      const jobBoards = await storage.listJobBoards();
      res.json(jobBoards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job boards" });
    }
  });

  // Submit a ghosting report
  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const reportData = insertGhostingReportSchema.parse(req.body);
      const report = await storage.createGhostingReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating ghosting report:", error);
        res.status(500).json({ message: "Failed to create ghosting report" });
      }
    }
  });

  // Get company ghosting rating
  app.get("/api/companies/:name/rating", async (req: Request, res: Response) => {
    try {
      const companyName = req.params.name;
      const ghostingRate = await storage.getCompanyGhostingRate(companyName);
      res.json({ company: companyName, ghostingRate });
    } catch (error) {
      console.error("Error fetching company rating:", error);
      res.status(500).json({ message: "Failed to fetch company rating" });
    }
  });

  // Get reports for a company
  app.get("/api/companies/:name/reports", async (req: Request, res: Response) => {
    try {
      const companyName = req.params.name;
      const reports = await storage.getGhostingReportsByCompany(companyName);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching company reports:", error);
      res.status(500).json({ message: "Failed to fetch company reports" });
    }
  });

  // Get top ghosting companies
  app.get("/api/stats/top-ghosting", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const topCompanies = await storage.getTopGhostingCompanies(limit);
      res.json(topCompanies);
    } catch (error) {
      console.error("Error fetching top ghosting companies:", error);
      res.status(500).json({ message: "Failed to fetch top ghosting companies" });
    }
  });

  // Get ghosting by industry
  app.get("/api/stats/by-industry", async (req: Request, res: Response) => {
    try {
      const industryData = await storage.getGhostingByIndustry();
      res.json(industryData);
    } catch (error) {
      console.error("Error fetching industry stats:", error);
      res.status(500).json({ message: "Failed to fetch industry statistics" });
    }
  });

  // Get recent reports
  app.get("/api/reports/recent", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recentReports = await storage.getRecentReports(limit);
      res.json(recentReports);
    } catch (error) {
      console.error("Error fetching recent reports:", error);
      res.status(500).json({ message: "Failed to fetch recent reports" });
    }
  });

  // Get all ghosting reports
  app.get("/api/reports", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const reports = await storage.listGhostingReports(limit);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
