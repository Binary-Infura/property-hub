const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
    console.log("Starting organization backfill...");
    
    // Find all users who don't have an organizationId but have an onboarder
    const users = await prisma.user.findMany({
        where: {
            organizationId: null,
            onboardedById: { not: null }
        },
        include: {
            onboardedBy: true
        }
    });
    
    console.log(`Found ${users.length} users to potentially backfill.`);
    
    for (const user of users) {
        if (user.onboardedBy && user.onboardedBy.organizationId) {
            console.log(`Updating user ${user.email} with organizationId ${user.onboardedBy.organizationId}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { organizationId: user.onboardedBy.organizationId }
            });
        }
    }
    
    console.log("Backfill complete.");
}

backfill().catch(console.error).finally(() => prisma.$disconnect());
