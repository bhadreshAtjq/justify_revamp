import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:DmfcIKNNUfOzYetEvLXCXGyFKFWqfCqF@nozomi.proxy.rlwy.net:46275/railway?sslmode=no-verify"
    }
  }
});

async function test() {
  console.log("Attempting to connect to Railway...");
  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! Connection successful. User count:", userCount);
  } catch (error: any) {
    console.error("FAILURE! Could not connect to Railway.");
    console.error("Error Message:", error.message);
    if (error.code) console.error("Error Code:", error.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();
