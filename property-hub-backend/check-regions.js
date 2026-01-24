const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const regions = await prisma.region.findMany();
    console.log(JSON.stringify(regions, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
