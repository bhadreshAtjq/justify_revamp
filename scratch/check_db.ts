import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const records = await prisma.studentRecord.findMany({ take: 5 })
  console.log(JSON.stringify(records, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
