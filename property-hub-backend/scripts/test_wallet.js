const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const userId = "e9babb03-6394-443c-8842-13014bfee625"; // Property Partner from my previous script
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
    });
    
    console.log("User Organization:", user.organization?.name);
    console.log("User Wallet Balance:", user.organization?.walletBalance?.toString());
    
    const transactions = await prisma.walletTransaction.findMany({
        where: { organizationId: user.organizationId }
    });
    console.log("Transactions Count:", transactions.length);
}

test().catch(console.error).finally(() => prisma.$disconnect());
