
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.organization.updateMany({
    where: {
      members: {
        some: {
          email: 'property_partner@propertyhub.com'
        }
      }
    },
    data: {
      isPremium: false,
      subscriptionMode: 'FREE'
    }
  });

  console.log('Reset organizations:', result.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
