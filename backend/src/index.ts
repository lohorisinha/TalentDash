import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import router from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use("/", router);

const seeds = [
  { company: 'google', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 1, base_salary: 2200000, bonus: 200000, stock: 800000 },
  { company: 'google', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 3, base_salary: 3500000, bonus: 400000, stock: 2000000 },
  { company: 'google', role: 'Software Engineer', level: 'L5', location: 'Bangalore', experience_years: 6, base_salary: 5200000, bonus: 800000, stock: 4500000 },
  { company: 'google', role: 'Product Manager', level: 'L4', location: 'Hyderabad', experience_years: 4, base_salary: 3800000, bonus: 500000, stock: 2200000 },
  { company: 'meta', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 1, base_salary: 2400000, bonus: 220000, stock: 900000 },
  { company: 'meta', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 3, base_salary: 3800000, bonus: 480000, stock: 2800000 },
  { company: 'meta', role: 'Software Engineer', level: 'L5', location: 'Bangalore', experience_years: 6, base_salary: 5800000, bonus: 900000, stock: 5500000 },
  { company: 'meta', role: 'ML Engineer', level: 'L5', location: 'Bangalore', experience_years: 5, base_salary: 6200000, bonus: 950000, stock: 6000000 },
  { company: 'amazon', role: 'SDE I', level: 'L3', location: 'Bangalore', experience_years: 1, base_salary: 1800000, bonus: 150000, stock: 500000 },
  { company: 'amazon', role: 'SDE II', level: 'L4', location: 'Bangalore', experience_years: 3, base_salary: 2800000, bonus: 300000, stock: 1500000 },
  { company: 'amazon', role: 'SDE III', level: 'L5', location: 'Bangalore', experience_years: 6, base_salary: 4200000, bonus: 550000, stock: 3500000 },
  { company: 'amazon', role: 'Data Engineer', level: 'L4', location: 'Hyderabad', experience_years: 4, base_salary: 2600000, bonus: 280000, stock: 1200000 },
  { company: 'microsoft', role: 'Software Engineer', level: 'L3', location: 'Hyderabad', experience_years: 1, base_salary: 2000000, bonus: 180000, stock: 600000 },
  { company: 'microsoft', role: 'Software Engineer', level: 'L4', location: 'Hyderabad', experience_years: 3, base_salary: 3000000, bonus: 350000, stock: 1600000 },
  { company: 'microsoft', role: 'Software Engineer', level: 'L5', location: 'Hyderabad', experience_years: 6, base_salary: 4500000, bonus: 600000, stock: 3800000 },
  { company: 'microsoft', role: 'ML Engineer', level: 'L4', location: 'Bangalore', experience_years: 4, base_salary: 3200000, bonus: 400000, stock: 2000000 },
  { company: 'flipkart', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 1, base_salary: 1500000, bonus: 120000, stock: 300000 },
  { company: 'flipkart', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 3, base_salary: 2200000, bonus: 200000, stock: 800000 },
  { company: 'flipkart', role: 'Software Engineer', level: 'L5', location: 'Bangalore', experience_years: 6, base_salary: 3200000, bonus: 350000, stock: 1800000 },
  { company: 'swiggy', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 1, base_salary: 1400000, bonus: 100000, stock: 200000 },
  { company: 'swiggy', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 3, base_salary: 2000000, bonus: 180000, stock: 600000 },
  { company: 'swiggy', role: 'Backend Engineer', level: 'L5', location: 'Bangalore', experience_years: 5, base_salary: 2800000, bonus: 280000, stock: 1200000 },
  { company: 'razorpay', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 1600000, bonus: 140000, stock: 400000 },
  { company: 'razorpay', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 4, base_salary: 2400000, bonus: 240000, stock: 1000000 },
  { company: 'razorpay', role: 'Product Manager', level: 'L4', location: 'Bangalore', experience_years: 4, base_salary: 2600000, bonus: 260000, stock: 1100000 },
  { company: 'zepto', role: 'Software Engineer', level: 'L3', location: 'Mumbai', experience_years: 1, base_salary: 1300000, bonus: 100000, stock: 300000 },
  { company: 'zepto', role: 'Software Engineer', level: 'L4', location: 'Mumbai', experience_years: 3, base_salary: 1900000, bonus: 160000, stock: 700000 },
  { company: 'zepto', role: 'ML Engineer', level: 'L4', location: 'Mumbai', experience_years: 3, base_salary: 2200000, bonus: 200000, stock: 900000 },
];

async function ensureSeeded() {
  const count = await prisma.salary.count();
  if (count >= 28) return;
  console.log(`DB has ${count} records — seeding...`);
  await prisma.salary.deleteMany();
  await prisma.salary.createMany({
    data: seeds.map(s => ({ ...s, total_compensation: s.base_salary + s.bonus + s.stock })),
  });
  console.log(`Seeded ${seeds.length} records.`);
}

ensureSeeded().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});