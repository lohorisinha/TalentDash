import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { salarySchema } from "./validators";

const router = Router();
const prisma = new PrismaClient();

router.get("/count", async (req: Request, res: Response) => {
  const count = await prisma.salary.count();
  return res.json({ count });
});

router.post("/ingest-salary", async (req: Request, res: Response) => {
  const parsed = salarySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  }
  const data = parsed.data;
  const company = data.company.toLowerCase().trim();
  const total_compensation = data.base_salary + data.bonus + data.stock;
  const salary = await prisma.salary.create({
    data: { ...data, company, total_compensation },
  });
  return res.status(201).json(salary);
});

router.get("/salaries", async (req: Request, res: Response) => {
  const { company, role, level, location } = req.query;
  const where: any = {};
  if (company) where.company = String(company).toLowerCase().trim();
  if (role) where.role = { contains: String(role), mode: "insensitive" };
  if (level) where.level = String(level);
  if (location) where.location = { contains: String(location), mode: "insensitive" };
  const salaries = await prisma.salary.findMany({ where, orderBy: { total_compensation: "desc" } });
  return res.json(salaries);
});

router.get("/company/:company", async (req: Request, res: Response) => {
  const company = String(req.params.company).toLowerCase().trim();
  const salaries = await prisma.salary.findMany({ where: { company }, orderBy: { total_compensation: "desc" } });
  if (salaries.length === 0) return res.status(404).json({ error: "Company not found" });
  const sorted = [...salaries].sort((a, b) => a.total_compensation - b.total_compensation);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1].total_compensation + sorted[mid].total_compensation) / 2
    : sorted[mid].total_compensation;
  const distribution: Record<string, number> = {};
  for (const s of salaries) {
    distribution[s.level] = (distribution[s.level] || 0) + 1;
  }
  return res.json({ salaries, median_compensation: median, level_distribution: distribution });
});

router.get("/compare", async (req: Request, res: Response) => {
  const { salaryId1, salaryId2 } = req.query;
  if (!salaryId1 || !salaryId2) return res.status(400).json({ error: "Both salaryId1 and salaryId2 are required" });
  const [s1, s2] = await Promise.all([
    prisma.salary.findUnique({ where: { id: String(salaryId1) } }),
    prisma.salary.findUnique({ where: { id: String(salaryId2) } }),
  ]);
  if (!s1 || !s2) return res.status(404).json({ error: "One or both salary IDs not found" });
  return res.json({
    salary1: { id: s1.id, company: s1.company, role: s1.role, level: s1.level, base: s1.base_salary, bonus: s1.bonus, stock: s1.stock, total: s1.total_compensation },
    salary2: { id: s2.id, company: s2.company, role: s2.role, level: s2.level, base: s2.base_salary, bonus: s2.bonus, stock: s2.stock, total: s2.total_compensation },
    diff: { base: s1.base_salary - s2.base_salary, bonus: s1.bonus - s2.bonus, stock: s1.stock - s2.stock, total: s1.total_compensation - s2.total_compensation },
  });
});

export default router;