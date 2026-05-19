import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listAll() {
  try {
    const users = await prisma.user.findMany({
      include: {
        institution: true
      } as any
    });
    console.log("=== USERS IN DATABASE ===");
    users.forEach(u => {
      console.log(`- ID: ${u.id}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Institution: ${(u as any).institution?.name || "None"}`);
    });
    console.log("=========================");

    const institutions = await (prisma as any).institution.findMany();
    console.log("=== INSTITUTIONS IN DATABASE ===");
    institutions.forEach((inst: any) => {
      console.log(`- ID: ${inst.id}`);
      console.log(`  Name: ${inst.name}`);
      console.log(`  Slug: ${inst.slug}`);
    });
    console.log("================================");
  } catch (error) {
    console.error("Failed to list data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listAll();
