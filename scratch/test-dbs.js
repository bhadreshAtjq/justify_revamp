const { PrismaClient } = require('@prisma/client');
async function test(url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.user.count();
    console.log('SUCCESS: ' + url);
  } catch(e) {
    console.log('FAIL: ' + url + ' - ' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}
async function run() {
  await test('postgresql://postgres:DmfcIKNNUfOzYetEvLXCXGyFKFWqfCqF@nozomi.proxy.rlwy.net:46275/railway');
  await test('postgresql://postgres:password@localhost:5432/justifai');
  await test('postgresql://postgres:password@localhost:5434/jadeledger');
  await test('postgresql://postgres:password@localhost:5433/jadeledger');
}
run();
