import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  console.log("Setting up Admin for Junagadh Agri Uni...");
  try {
    const inst = await (prisma as any).institution.findFirst({
      where: { name: { contains: "Junagadh" } }
    });

    if (!inst) {
      console.log("Institution not found!");
      return;
    }

    const email = "jau_admin@justifai.io";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await (prisma as any).user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        institutionId: inst.id,
        role: "INSTITUTION_ADMIN"
      },
      create: {
        email,
        password: hashedPassword,
        name: "JAU Administrator",
        role: "INSTITUTION_ADMIN",
        institutionId: inst.id
      }
    });

    console.log(`Admin user created/updated: ${email}`);
    console.log(`Institution: ${inst.name}`);
    console.log(`Login Password: ${password}`);
  } catch (err) {
    console.error("Setup failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
