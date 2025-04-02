import {
  companies,
  ghostingReports,
  type Company,
  type InsertCompany,
  type GhostingReport,
  type InsertGhostingReport,
  type CompanyStats,
  APPLICATION_STAGES,
} from "@shared/schema";

export interface IStorage {
  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByName(name: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;

  // Ghosting report methods
  getGhostingReport(id: number): Promise<GhostingReport | undefined>;
  getCompanyReports(companyId: number): Promise<GhostingReport[]>;
  createGhostingReport(report: InsertGhostingReport): Promise<GhostingReport>;
  
  // Stats methods
  getCompanyStats(companyId: number): Promise<CompanyStats>;
  getCompanyStatsByName(companyName: string): Promise<CompanyStats | undefined>;
  getCompanyStatsForUrl(jobUrl: string): Promise<CompanyStats | undefined>;
}

export class MemStorage implements IStorage {
  private companies: Map<number, Company>;
  private ghostingReports: Map<number, GhostingReport>;
  private companyIdCounter: number;
  private reportIdCounter: number;

  constructor() {
    this.companies = new Map();
    this.ghostingReports = new Map();
    this.companyIdCounter = 1;
    this.reportIdCounter = 1;
  }

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    const normalizedName = name.toLowerCase().trim();
    return Array.from(this.companies.values()).find(
      (company) => company.name.toLowerCase().trim() === normalizedName
    );
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const company: Company = {
      ...insertCompany,
      id,
      createdAt: new Date(),
    };
    this.companies.set(id, company);
    return company;
  }

  // Ghosting report methods
  async getGhostingReport(id: number): Promise<GhostingReport | undefined> {
    return this.ghostingReports.get(id);
  }

  async getCompanyReports(companyId: number): Promise<GhostingReport[]> {
    return Array.from(this.ghostingReports.values()).filter(
      (report) => report.companyId === companyId
    );
  }

  async createGhostingReport(insertReport: InsertGhostingReport): Promise<GhostingReport> {
    const id = this.reportIdCounter++;
    const report: GhostingReport = {
      ...insertReport,
      id,
      reportDate: new Date(),
    };
    this.ghostingReports.set(id, report);
    return report;
  }

  // Stats methods
  async getCompanyStats(companyId: number): Promise<CompanyStats> {
    const company = await this.getCompany(companyId);
    if (!company) {
      throw new Error(`Company with ID ${companyId} not found`);
    }

    const reports = await this.getCompanyReports(companyId);
    const totalReports = reports.length;
    
    // Calculate ghosting rate (% of total reports)
    const ghostingRate = totalReports > 0 ? 100 : 0;
    
    // Calculate stage breakdown
    const stageBreakdown: Record<string, number> = {};
    APPLICATION_STAGES.forEach(stage => {
      const stageReports = reports.filter(r => r.applicationStage === stage);
      const percentage = totalReports > 0 
        ? Math.round((stageReports.length / totalReports) * 100) 
        : 0;
      stageBreakdown[stage] = percentage;
    });

    // Get recent reports (maximum 5, sorted by date descending)
    const recentReports = reports
      .sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime())
      .slice(0, 5)
      .map(report => ({
        id: report.id,
        applicationStage: report.applicationStage,
        reportDate: report.reportDate.toISOString(),
        details: report.details,
      }));

    return {
      id: company.id,
      name: company.name,
      ghostingRate,
      totalReports,
      stageBreakdown,
      recentReports,
    };
  }

  async getCompanyStatsByName(companyName: string): Promise<CompanyStats | undefined> {
    const company = await this.getCompanyByName(companyName);
    if (!company) {
      return undefined;
    }
    return this.getCompanyStats(company.id);
  }

  async getCompanyStatsForUrl(jobUrl: string): Promise<CompanyStats | undefined> {
    // Find report that matches this URL
    const report = Array.from(this.ghostingReports.values()).find(
      r => r.jobUrl === jobUrl
    );
    
    if (!report) {
      return undefined;
    }
    
    return this.getCompanyStats(report.companyId);
  }
}

export const storage = new MemStorage();
