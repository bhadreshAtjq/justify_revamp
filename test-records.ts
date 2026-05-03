import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking DB connection for StudentRecord...");
  try {
    const count = await (prisma as any).studentRecord.count();
    console.log("Connection successful! Record count:", count);
  } catch (err: any) {
    console.error("Connection failed!");
    console.error("Error Code:", err.code);
    console.error("Message:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
