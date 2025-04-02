import {
  type User,
  type Employer,
  type JobListing,
  type GhostingReport,
  type InsertUser,
  type InsertEmployer,
  type InsertJobListing,
  type InsertGhostingReport,
  type EmployerWithStats,
  type JobListingWithStats,
  type GhostingReportWithDetails
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employer operations
  getEmployer(id: number): Promise<Employer | undefined>;
  getEmployerByName(name: string): Promise<Employer | undefined>;
  getEmployerByDomain(domain: string): Promise<Employer | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;
  getTopEmployers(limit: number): Promise<EmployerWithStats[]>;
  searchEmployers(query: string): Promise<Employer[]>;
  
  // Job listing operations
  getJobListing(id: number): Promise<JobListing | undefined>;
  getJobListingByUrl(url: string): Promise<JobListing | undefined>;
  getJobListingByPlatformId(platform: string, platformJobId: string): Promise<JobListing | undefined>;
  createJobListing(jobListing: InsertJobListing): Promise<JobListing>;
  getRecentJobListings(limit: number): Promise<JobListingWithStats[]>;
  
  // Ghosting report operations
  getGhostingReport(id: number): Promise<GhostingReport | undefined>;
  createGhostingReport(report: InsertGhostingReport): Promise<GhostingReport>;
  getGhostingReportsByEmployer(employerId: number): Promise<GhostingReport[]>;
  getGhostingReportsByJobListing(jobListingId: number): Promise<GhostingReport[]>;
  getGhostingReportsBySubmitter(submitterId: string): Promise<GhostingReportWithDetails[]>;
  getJobListingStats(jobListingId: number): Promise<{reportCount: number, applicantCount: number, ghostingScore: number}>;
  getEmployerStats(employerId: number): Promise<{reportCount: number, averageRating: number}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private employers: Map<number, Employer>;
  private jobListings: Map<number, JobListing>;
  private ghostingReports: Map<number, GhostingReport>;
  
  private userId: number;
  private employerId: number;
  private jobListingId: number;
  private ghostingReportId: number;
  
  constructor() {
    this.users = new Map();
    this.employers = new Map();
    this.jobListings = new Map();
    this.ghostingReports = new Map();
    
    this.userId = 1;
    this.employerId = 1;
    this.jobListingId = 1;
    this.ghostingReportId = 1;
    
    // Seed some initial data
    this.seedData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Employer operations
  async getEmployer(id: number): Promise<Employer | undefined> {
    return this.employers.get(id);
  }
  
  async getEmployerByName(name: string): Promise<Employer | undefined> {
    return Array.from(this.employers.values()).find(
      employer => employer.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getEmployerByDomain(domain: string): Promise<Employer | undefined> {
    return Array.from(this.employers.values()).find(
      employer => employer.domain === domain
    );
  }
  
  async createEmployer(employer: InsertEmployer): Promise<Employer> {
    const id = this.employerId++;
    const newEmployer: Employer = { ...employer, id, createdAt: new Date() };
    this.employers.set(id, newEmployer);
    return newEmployer;
  }
  
  async getTopEmployers(limit: number): Promise<EmployerWithStats[]> {
    const employers = Array.from(this.employers.values());
    const employersWithStats = await Promise.all(
      employers.map(async (employer) => {
        const stats = await this.getEmployerStats(employer.id);
        return {
          ...employer,
          ...stats
        };
      })
    );
    
    return employersWithStats
      .filter(e => e.reportCount > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  }
  
  async searchEmployers(query: string): Promise<Employer[]> {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return Array.from(this.employers.values()).filter(
      employer => employer.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Job listing operations
  async getJobListing(id: number): Promise<JobListing | undefined> {
    return this.jobListings.get(id);
  }
  
  async getJobListingByUrl(url: string): Promise<JobListing | undefined> {
    return Array.from(this.jobListings.values()).find(
      jobListing => jobListing.jobUrl === url
    );
  }
  
  async getJobListingByPlatformId(platform: string, platformJobId: string): Promise<JobListing | undefined> {
    return Array.from(this.jobListings.values()).find(
      jobListing => jobListing.platform === platform && jobListing.platformJobId === platformJobId
    );
  }
  
  async createJobListing(jobListing: InsertJobListing): Promise<JobListing> {
    const id = this.jobListingId++;
    const newJobListing: JobListing = { ...jobListing, id, createdAt: new Date() };
    this.jobListings.set(id, newJobListing);
    return newJobListing;
  }
  
  async getRecentJobListings(limit: number): Promise<JobListingWithStats[]> {
    const jobListings = Array.from(this.jobListings.values());
    const jobListingsWithStats = await Promise.all(
      jobListings.map(async (job) => {
        const employer = await this.getEmployer(job.employerId);
        const stats = await this.getJobListingStats(job.id);
        let rating = "Unknown";
        
        if (stats.ghostingScore >= 0.8) rating = "Excellent";
        else if (stats.ghostingScore >= 0.6) rating = "Good";
        else if (stats.ghostingScore >= 0.4) rating = "Moderate";
        else if (stats.ghostingScore >= 0.2) rating = "Poor";
        else rating = "Very Poor";
        
        return {
          ...job,
          employer: employer!,
          ...stats,
          rating
        };
      })
    );
    
    return jobListingsWithStats
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  // Ghosting report operations
  async getGhostingReport(id: number): Promise<GhostingReport | undefined> {
    return this.ghostingReports.get(id);
  }
  
  async createGhostingReport(report: InsertGhostingReport): Promise<GhostingReport> {
    const id = this.ghostingReportId++;
    const newReport: GhostingReport = { ...report, id, createdAt: new Date() };
    this.ghostingReports.set(id, newReport);
    return newReport;
  }
  
  async getGhostingReportsByEmployer(employerId: number): Promise<GhostingReport[]> {
    return Array.from(this.ghostingReports.values())
      .filter(report => report.employerId === employerId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getGhostingReportsByJobListing(jobListingId: number): Promise<GhostingReport[]> {
    return Array.from(this.ghostingReports.values())
      .filter(report => report.jobListingId === jobListingId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getGhostingReportsBySubmitter(submitterId: string): Promise<GhostingReportWithDetails[]> {
    const reports = Array.from(this.ghostingReports.values())
      .filter(report => report.submitterId === submitterId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
      
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const employer = await this.getEmployer(report.employerId);
        let jobListing = undefined;
        
        if (report.jobListingId) {
          jobListing = await this.getJobListing(report.jobListingId);
        }
        
        return {
          ...report,
          employer: employer!,
          jobListing
        };
      })
    );
    
    return reportsWithDetails;
  }
  
  async getJobListingStats(jobListingId: number): Promise<{reportCount: number, applicantCount: number, ghostingScore: number}> {
    const reports = await this.getGhostingReportsByJobListing(jobListingId);
    // For demo purposes, generate a number of applicants higher than reports
    const applicantCount = Math.max(Math.floor(reports.length * (1 + Math.random() * 2)), reports.length);
    // The higher the number, the better (fewer ghostings per applicant)
    const ghostingScore = applicantCount > 0 ? 1 - (reports.length / applicantCount) : 0;
    
    return {
      reportCount: reports.length,
      applicantCount,
      ghostingScore
    };
  }
  
  async getEmployerStats(employerId: number): Promise<{reportCount: number, averageRating: number}> {
    const reports = await this.getGhostingReportsByEmployer(employerId);
    
    // For employers, we calculate a rating between 0-5
    // The fewer reports relative to the size of the company, the better the rating
    let score = 0;
    if (reports.length > 0) {
      // This is a simplified calculation - in a real app, this would be more sophisticated
      const ghostingStageWeights = {
        application: 0.2,
        screening: 0.4,
        interview: 0.6,
        assessment: 0.8,
        offer: 1.0
      };
      
      const stageScores = reports.map(report => {
        const weight = ghostingStageWeights[report.stage as keyof typeof ghostingStageWeights] || 0.5;
        return 5 * (1 - weight); // Higher stage = worse score
      });
      
      score = stageScores.reduce((sum, score) => sum + score, 0) / reports.length;
    } else {
      score = 5; // Perfect score if no reports
    }
    
    return {
      reportCount: reports.length,
      averageRating: score
    };
  }
  
  private seedData() {
    // Add some initial seed data for demonstration
    const demoEmployers: InsertEmployer[] = [
      { name: "TechCorp Solutions", website: "https://techcorp.example.com", domain: "techcorp.example.com" },
      { name: "CreativeWorks Inc.", website: "https://creativeworks.example.com", domain: "creativeworks.example.com" },
      { name: "BrandBoost Media", website: "https://brandboost.example.com", domain: "brandboost.example.com" },
      { name: "InnovateX Solutions", website: "https://innovatex.example.com", domain: "innovatex.example.com" },
      { name: "Acme Corporation", website: "https://acme.example.com", domain: "acme.example.com" },
      { name: "GlobalTech Holdings", website: "https://globaltech.example.com", domain: "globaltech.example.com" }
    ];
    
    demoEmployers.forEach(employer => {
      this.createEmployer(employer);
    });
  }
}

export const storage = new MemStorage();
