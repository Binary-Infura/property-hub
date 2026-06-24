const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const statsRaw = await prisma.project.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        console.log("StatsRaw:", statsRaw);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
