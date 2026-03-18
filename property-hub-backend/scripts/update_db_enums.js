const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Adding DRAFT to enums via raw SQL...');

  try {
    // Check if tables exist
    await prisma.$queryRaw`SELECT 1`;
    
    // Add DRAFT variant
    try {
      await prisma.$executeRawUnsafe("ALTER TYPE \"ProjectStatus\" ADD VALUE 'DRAFT'");
      console.log('Added DRAFT to ProjectStatus.');
    } catch (e) {
      console.log('ProjectStatus DRAFT add error (maybe already exists):', e.message);
    }

    try {
      await prisma.$executeRawUnsafe("ALTER TYPE \"UnitStatus\" ADD VALUE 'DRAFT'");
      console.log('Added DRAFT to UnitStatus.');
    } catch (e) {
      console.log('UnitStatus DRAFT add error (maybe already exists):', e.message);
    }

    // Now update existing data
    console.log('Updating existing records...');
    try {
        const pMod = await prisma.$executeRawUnsafe("UPDATE \"projects\" SET status = 'DRAFT' WHERE status IN ('AVAILABLE', 'SOLD', 'RESERVED', 'PUBLISHED')");
        console.log(`Updated ${pMod} Projects.`);
    } catch (e) {
        console.log('Project update error:', e.message);
    }

    try {
        const uMod = await prisma.$executeRawUnsafe("UPDATE \"property_units\" SET status = 'DRAFT' WHERE status = 'AVAILABLE'");
        console.log(`Updated ${uMod} Units.`);
    } catch (e) {
        console.log('Unit update error:', e.message);
    }

    console.log('Process completed.');
  } catch (e) {
    console.error('Fatal error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
