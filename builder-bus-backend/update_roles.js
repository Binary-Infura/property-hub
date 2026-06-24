const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Delete invitations that only have these roles, or remove them from the array
    const invitations = await prisma.invitation.findMany();
    for (const inv of invitations) {
        const newRoles = inv.roles.filter(r => r !== 'BROKER' && r !== 'VISIT_EXECUTIVE');
        if (newRoles.length === 0) {
            await prisma.invitation.delete({ where: { id: inv.id } });
        } else if (newRoles.length !== inv.roles.length) {
            await prisma.invitation.update({ where: { id: inv.id }, data: { roles: newRoles } });
        }
    }

    // 2. Update users
    const users = await prisma.user.findMany();
    for (const user of users) {
        const newRoles = user.roles.filter(r => r !== 'BROKER' && r !== 'VISIT_EXECUTIVE');
        let newActiveRole = user.activeRole;
        if (newActiveRole === 'BROKER' || newActiveRole === 'VISIT_EXECUTIVE') {
            newActiveRole = newRoles.length > 0 ? newRoles[0] : null;
        }

        if (newRoles.length !== user.roles.length || newActiveRole !== user.activeRole) {
            if (newRoles.length === 0) {
                 // user has no other roles, maybe assign BUYER as fallback or delete
                 newRoles.push('BUYER');
                 newActiveRole = 'BUYER';
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { roles: newRoles, activeRole: newActiveRole }
            });
        }
    }
}
main().then(() => console.log('Done')).catch(e => console.error(e)).finally(() => prisma.$disconnect());
