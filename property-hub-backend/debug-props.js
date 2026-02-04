const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- START DEBUG ---');
    const allProps = await prisma.property.findMany({
        include: {
            region: true
        }
    });

    console.log('Total Properties:', allProps.length);
    allProps.forEach(p => {
        console.log(`- [${p.id}] ${p.name} | City: ${p.city} | Location: ${p.location} | Status: ${p.status} | RegionCode: ${p.region?.code || 'NULL'}`);
    });
    console.log('--- END DEBUG ---');
}

check().then(() => prisma.$disconnect());
