import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Using raw queries to update statuses in the database...');

  try {
    // Check if tables exist
    await prisma.$queryRaw`SELECT 1`;
    
    // Attempt update for Project
    console.log('Trying to update Projects...');
    try {
      const projects = await prisma.$executeRawUnsafe("UPDATE \"Project\" SET status = 'DRAFT' WHERE status IN ('AVAILABLE', 'SOLD', 'RESERVED', 'PUBLISHED')");
      console.log(`Updated ${projects} projects.`);
    } catch (e: any) {
      console.log('Skipping Projects update (maybe column doesn\'t exist or already updated). Error:', e.message);
    }

    // Attempt update for PropertyUnit
    console.log('Trying to update PropertyUnits...');
    try {
      const units = await prisma.$executeRawUnsafe("UPDATE \"PropertyUnit\" SET status = 'DRAFT' WHERE status = 'AVAILABLE'");
      console.log(`Updated ${units} units.`);
    } catch (e: any) {
      console.log('Skipping Units update. Error:', e.message);
    }

    console.log('Statuses update process completed.');
  } catch (e: any) {
    console.error('Fatal error during update:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
