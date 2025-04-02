import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEmployerSchema, 
  insertJobListingSchema, 
  insertGhostingReportSchema,
  GhostingStage
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Employers API
  apiRouter.get("/employers/top", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topEmployers = await storage.getTopEmployers(limit);
      res.json(topEmployers);
    } catch (error) {
      console.error("Error fetching top employers:", error);
      res.status(500).json({ message: "Failed to fetch top employers" });
    }
  });
  
  apiRouter.get("/employers/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const employers = await storage.searchEmployers(query);
      res.json(employers);
    } catch (error) {
      console.error("Error searching employers:", error);
      res.status(500).json({ message: "Failed to search employers" });
    }
  });
  
  apiRouter.get("/employers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const employer = await storage.getEmployer(id);
      
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }
      
      const stats = await storage.getEmployerStats(id);
      res.json({ ...employer, ...stats });
    } catch (error) {
      console.error("Error fetching employer:", error);
      res.status(500).json({ message: "Failed to fetch employer" });
    }
  });
  
  apiRouter.post("/employers", async (req: Request, res: Response) => {
    try {
      const parsed = insertEmployerSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid employer data", 
          errors: fromZodError(parsed.error).message 
        });
      }
      
      // Check if employer already exists by name
      const existingEmployer = await storage.getEmployerByName(parsed.data.name);
      if (existingEmployer) {
        return res.json(existingEmployer);
      }
      
      const newEmployer = await storage.createEmployer(parsed.data);
      res.status(201).json(newEmployer);
    } catch (error) {
      console.error("Error creating employer:", error);
      res.status(500).json({ message: "Failed to create employer" });
    }
  });
  
  // Job listings API
  apiRouter.get("/job-listings/recent", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const jobListings = await storage.getRecentJobListings(limit);
      res.json(jobListings);
    } catch (error) {
      console.error("Error fetching recent job listings:", error);
      res.status(500).json({ message: "Failed to fetch recent job listings" });
    }
  });
  
  apiRouter.get("/job-listings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const jobListing = await storage.getJobListing(id);
      
      if (!jobListing) {
        return res.status(404).json({ message: "Job listing not found" });
      }
      
      const employer = await storage.getEmployer(jobListing.employerId);
      const stats = await storage.getJobListingStats(id);
      
      let rating = "Unknown";
      if (stats.ghostingScore >= 0.8) rating = "Excellent";
      else if (stats.ghostingScore >= 0.6) rating = "Good";
      else if (stats.ghostingScore >= 0.4) rating = "Moderate";
      else if (stats.ghostingScore >= 0.2) rating = "Poor";
      else rating = "Very Poor";
      
      res.json({ 
        ...jobListing, 
        employer,
        ...stats,
        rating
      });
    } catch (error) {
      console.error("Error fetching job listing:", error);
      res.status(500).json({ message: "Failed to fetch job listing" });
    }
  });
  
  apiRouter.post("/job-listings", async (req: Request, res: Response) => {
    try {
      const parsed = insertJobListingSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid job listing data", 
          errors: fromZodError(parsed.error).message 
        });
      }
      
      // Check if job listing already exists by URL or platform ID
      let existingJobListing;
      if (parsed.data.jobUrl) {
        existingJobListing = await storage.getJobListingByUrl(parsed.data.jobUrl);
      }
      
      if (!existingJobListing && parsed.data.platformJobId) {
        existingJobListing = await storage.getJobListingByPlatformId(
          parsed.data.platform,
          parsed.data.platformJobId
        );
      }
      
      if (existingJobListing) {
        return res.json(existingJobListing);
      }
      
      const newJobListing = await storage.createJobListing(parsed.data);
      res.status(201).json(newJobListing);
    } catch (error) {
      console.error("Error creating job listing:", error);
      res.status(500).json({ message: "Failed to create job listing" });
    }
  });
  
  // Ghosting reports API
  apiRouter.get("/reports", async (req: Request, res: Response) => {
    try {
      const submitterId = req.query.submitterId as string;
      
      if (!submitterId) {
        return res.status(400).json({ message: "submitterId parameter is required" });
      }
      
      const reports = await storage.getGhostingReportsBySubmitter(submitterId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  
  apiRouter.post("/reports", async (req: Request, res: Response) => {
    try {
      const reportSchema = insertGhostingReportSchema.extend({
        stage: z.nativeEnum(GhostingStage),
        date: z.coerce.date()
      });
      
      const parsed = reportSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid report data", 
          errors: fromZodError(parsed.error).message 
        });
      }
      
      const newReport = await storage.createGhostingReport(parsed.data);
      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });
  
  apiRouter.get("/reports/employer/:employerId", async (req: Request, res: Response) => {
    try {
      const employerId = parseInt(req.params.employerId);
      const reports = await storage.getGhostingReportsByEmployer(employerId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching employer reports:", error);
      res.status(500).json({ message: "Failed to fetch employer reports" });
    }
  });
  
  apiRouter.get("/reports/job/:jobListingId", async (req: Request, res: Response) => {
    try {
      const jobListingId = parseInt(req.params.jobListingId);
      const reports = await storage.getGhostingReportsByJobListing(jobListingId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching job listing reports:", error);
      res.status(500).json({ message: "Failed to fetch job listing reports" });
    }
  });
  
  // Register API routes with /api prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
