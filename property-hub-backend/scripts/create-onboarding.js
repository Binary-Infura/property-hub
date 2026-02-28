const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log('Creating default Onboarding Manager...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const obEmail = 'onboard@propertyhub.com';

    await prisma.user.upsert({
        where: { email: obEmail },
        update: {
            roles: ['onboarding-manager'],
            passwordHash: passwordHash
        },
        create: {
            email: obEmail,
            firstName: 'Onboarding',
            lastName: 'Manager',
            roles: ['onboarding-manager'],
            status: 'active',
            passwordHash: passwordHash,
        }
    });
    console.log('Successfully created onboarding manager');
}
main().catch(console.error).finally(() => prisma.$disconnect());
