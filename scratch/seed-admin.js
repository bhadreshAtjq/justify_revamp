const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("Seeding local database...");

    // 1. Create a default institution
    const inst = await prisma.institution.upsert({
      where: { slug: "dwuns" },
      update: {},
      create: {
        name: "Dr. W.U.N.S. University",
        slug: "dwuns",
      }
    });
    console.log("Institution created:", inst.name, inst.id);

    // 2. Create super admin user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "superadmin@justify.com" },
      update: {
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
      create: {
        email: "superadmin@justify.com",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        institutionId: inst.id,
      }
    });
    console.log("Super Admin created:", admin.email, admin.id);

    console.log("\n=== Seed complete ===");
    console.log("Login: superadmin@justify.com / password123");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
