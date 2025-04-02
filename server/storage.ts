import { 
  users, type User, type InsertUser, 
  companies, type Company, type InsertCompany,
  ghostingReports, type GhostingReport, type InsertGhostingReport,
  jobBoards, type JobBoard, type InsertJobBoard 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByName(name: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  listCompanies(): Promise<Company[]>;
  
  // Ghosting report operations
  createGhostingReport(report: InsertGhostingReport): Promise<GhostingReport>;
  getGhostingReport(id: number): Promise<GhostingReport | undefined>;
  getGhostingReportsByCompany(companyName: string): Promise<GhostingReport[]>;
  listGhostingReports(limit?: number): Promise<GhostingReport[]>;
  
  // Job board operations
  listJobBoards(): Promise<JobBoard[]>;
  getJobBoard(id: number): Promise<JobBoard | undefined>;
  createJobBoard(jobBoard: InsertJobBoard): Promise<JobBoard>;
  
  // Statistics operations
  getCompanyGhostingRate(companyName: string): Promise<number>;
  getTopGhostingCompanies(limit?: number): Promise<{company: string, ghostingRate: number, reportCount: number}[]>;
  getGhostingByIndustry(): Promise<{industry: string, ghostingRate: number}[]>;
  getRecentReports(limit?: number): Promise<GhostingReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private ghostingReports: Map<number, GhostingReport>;
  private jobBoards: Map<number, JobBoard>;
  
  private userIdCounter: number;
  private companyIdCounter: number;
  private reportIdCounter: number;
  private jobBoardIdCounter: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.ghostingReports = new Map();
    this.jobBoards = new Map();
    
    this.userIdCounter = 1;
    this.companyIdCounter = 1;
    this.reportIdCounter = 1;
    this.jobBoardIdCounter = 1;
    
    // Initialize with default job boards
    this.seedJobBoards();
  }

  private seedJobBoards() {
    const defaultJobBoards: InsertJobBoard[] = [
      { name: 'LinkedIn', domainPattern: 'linkedin.com', enabled: true },
      { name: 'Indeed', domainPattern: 'indeed.com', enabled: true },
      { name: 'ZipRecruiter', domainPattern: 'ziprecruiter.com', enabled: true },
      { name: 'Monster', domainPattern: 'monster.com', enabled: true },
      { name: 'Glassdoor', domainPattern: 'glassdoor.com', enabled: true }
    ];
    
    defaultJobBoards.forEach(board => {
      this.createJobBoard(board);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const newCompany: Company = { ...company, id };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async listCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  // Ghosting report operations
  async createGhostingReport(report: InsertGhostingReport): Promise<GhostingReport> {
    const id = this.reportIdCounter++;
    const newReport: GhostingReport = { 
      ...report, 
      id, 
      reportedAt: new Date() 
    };
    this.ghostingReports.set(id, newReport);
    
    // Ensure company exists
    const existingCompany = await this.getCompanyByName(report.companyName);
    if (!existingCompany) {
      await this.createCompany({ 
        name: report.companyName, 
        industry: undefined, 
        website: undefined 
      });
    }
    
    return newReport;
  }

  async getGhostingReport(id: number): Promise<GhostingReport | undefined> {
    return this.ghostingReports.get(id);
  }

  async getGhostingReportsByCompany(companyName: string): Promise<GhostingReport[]> {
    return Array.from(this.ghostingReports.values()).filter(
      (report) => report.companyName.toLowerCase() === companyName.toLowerCase(),
    );
  }

  async listGhostingReports(limit: number = 100): Promise<GhostingReport[]> {
    return Array.from(this.ghostingReports.values())
      .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())
      .slice(0, limit);
  }

  // Job board operations
  async listJobBoards(): Promise<JobBoard[]> {
    return Array.from(this.jobBoards.values());
  }

  async getJobBoard(id: number): Promise<JobBoard | undefined> {
    return this.jobBoards.get(id);
  }

  async createJobBoard(jobBoard: InsertJobBoard): Promise<JobBoard> {
    const id = this.jobBoardIdCounter++;
    const newJobBoard: JobBoard = { ...jobBoard, id };
    this.jobBoards.set(id, newJobBoard);
    return newJobBoard;
  }

  // Statistics operations
  async getCompanyGhostingRate(companyName: string): Promise<number> {
    const reports = await this.getGhostingReportsByCompany(companyName);
    if (reports.length === 0) return 0;
    
    // For simplicity, the ghosting rate is the number of reports 
    // divided by an arbitrary base value (e.g., 10) to simulate percentage
    return Math.min(Math.round((reports.length / 10) * 100), 100);
  }

  async getTopGhostingCompanies(limit: number = 5): Promise<{company: string, ghostingRate: number, reportCount: number}[]> {
    const allReports = Array.from(this.ghostingReports.values());
    
    // Count reports by company
    const companyCounts = new Map<string, number>();
    allReports.forEach(report => {
      const current = companyCounts.get(report.companyName) || 0;
      companyCounts.set(report.companyName, current + 1);
    });
    
    // Convert to array and sort by count
    const result = Array.from(companyCounts.entries())
      .map(([company, count]) => {
        const ghostingRate = Math.min(Math.round((count / 10) * 100), 100);
        return { company, ghostingRate, reportCount: count };
      })
      .sort((a, b) => b.reportCount - a.reportCount);
    
    return result.slice(0, limit);
  }

  async getGhostingByIndustry(): Promise<{industry: string, ghostingRate: number}[]> {
    // For simplicity, we'll return mock industry data
    return [
      { industry: 'Technology', ghostingRate: 78 },
      { industry: 'Finance', ghostingRate: 64 },
      { industry: 'Healthcare', ghostingRate: 42 },
      { industry: 'Education', ghostingRate: 27 }
    ];
  }

  async getRecentReports(limit: number = 5): Promise<GhostingReport[]> {
    return this.listGhostingReports(limit);
  }
}

export const storage = new MemStorage();
