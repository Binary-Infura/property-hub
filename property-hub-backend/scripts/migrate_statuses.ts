import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRaw`ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';`;
  await prisma.$executeRaw`UPDATE "projects" SET "status" = 'PUBLISHED' WHERE "status"::text IN ('APPROVED', 'SUBMITTED', 'UNDER_CONSTRUCTION');`;
  await prisma.$executeRaw`UPDATE "projects" SET "status" = 'DRAFT' WHERE "status"::text IN ('REJECTED');`;
  console.log('Statuses migrated.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
