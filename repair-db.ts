import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function repair() {
  console.log("Starting data repair...");
  try {
    // 1. Get or Create a default institution
    let targetInst = await (prisma as any).institution.findFirst();
    
    if (!targetInst) {
      console.log("No institution found. Creating default 'JustifAI University'...");
      targetInst = await (prisma as any).institution.create({
        data: {
          name: "JustifAI University",
          slug: "justifai-uni",
        }
      });
    }

    console.log(`Using Institution: ${targetInst.name} (${targetInst.id})`);

    // 2. Link orphaned StudentRecords
    const records = await (prisma as any).studentRecord.updateMany({
      where: { institutionId: null },
      data: { institutionId: targetInst.id }
    });
    console.log(`Linked ${records.count} orphaned StudentRecords to ${targetInst.name}`);

    // 3. Link orphaned MerkleAnchors
    const anchors = await (prisma as any).merkleAnchor.updateMany({
      where: { institutionId: null },
      data: { institutionId: targetInst.id }
    });
    console.log(`Linked ${anchors.count} orphaned MerkleAnchors to ${targetInst.name}`);

    // 4. Ensure SuperAdmin is linked to nothing or specific (usually SuperAdmin has no inst)
    
    console.log("Data repair complete!");
  } catch (err) {
    console.error("Repair failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

repair();
