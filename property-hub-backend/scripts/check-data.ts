
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const roles = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true,
            },
        });
        console.log('User counts by role:', JSON.stringify(roles, null, 2));

        const totalUsers = await prisma.user.count();
        console.log('Total users:', totalUsers);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
