import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Running query...");
    const where: any = {};
    const page = 1;
    const limit = 8;
    
    // Simulating myOnly = true
    // we just use a valid onboardedById if we know one, or leave it empty to test
    // let's leave where empty first
    try {
        const [results, total, statsRaw] = await Promise.all([
            prisma.project.findMany({
                where,
                include: {
                    addressRecord: {
                        include: {
                            city: true
                        }
                    },
                    onboardedBy: {
                        include: {
                            organization: true,
                        },
                    },
                    assignedTo: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.project.count({ where }),
            prisma.project.groupBy({
                by: ['status'],
                where: { ...where, status: undefined },
                _count: { id: true }
            })
        ]);
        console.log("Success!", { total, statsRaw });
    } catch (e) {
        console.error("Prisma error:", e);
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
