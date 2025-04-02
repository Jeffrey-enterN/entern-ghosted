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
import { db } from "./db";
import { eq, sql, desc, like, ilike } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    const results = await db.select().from(companies).where(eq(companies.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    const normalizedName = name.toLowerCase().trim();
    const results = await db
      .select()
      .from(companies)
      .where(sql`LOWER(TRIM(${companies.name})) = ${normalizedName}`);
    return results.length > 0 ? results[0] : undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const results = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return results[0];
  }

  // Ghosting report methods
  async getGhostingReport(id: number): Promise<GhostingReport | undefined> {
    const results = await db.select().from(ghostingReports).where(eq(ghostingReports.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getCompanyReports(companyId: number): Promise<GhostingReport[]> {
    return db.select().from(ghostingReports).where(eq(ghostingReports.companyId, companyId));
  }

  async createGhostingReport(insertReport: InsertGhostingReport): Promise<GhostingReport> {
    const results = await db
      .insert(ghostingReports)
      .values(insertReport)
      .returning();
    return results[0];
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
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
      .slice(0, 5)
      .map(report => ({
        id: report.id,
        applicationStage: report.applicationStage,
        reportDate: new Date(report.reportDate).toISOString(),
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
    const results = await db
      .select()
      .from(ghostingReports)
      .where(eq(ghostingReports.jobUrl, jobUrl));
    
    const report = results.length > 0 ? results[0] : undefined;
    
    if (!report) {
      return undefined;
    }
    
    return this.getCompanyStats(report.companyId);
  }
}

export const storage = new DatabaseStorage();
