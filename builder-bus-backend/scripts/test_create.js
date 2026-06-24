const { PrismaClient, ProjectStatus, ProjectType } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing project creation with DRAFT status...');
  try {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project DRAFT',
        location: 'Test Location',
        status: 'DRAFT',
        price: 0,
        projectType: 'APARTMENT',
        category: 'flat'
      }
    });
    console.log('Project created successfully:', project.id);
    await prisma.project.delete({ where: { id: project.id } });
    console.log('Test project deleted.');
  } catch (e) {
    console.error('Project creation failed in script:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
