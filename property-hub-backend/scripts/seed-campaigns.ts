import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding marketing campaigns...');

    // Get marketing managers
    const marketing1 = await prisma.user.findFirst({ where: { email: 'marketing1@propertyhub.com' } });
    const marketing2 = await prisma.user.findFirst({ where: { email: 'marketing2@propertyhub.com' } });

    if (!marketing1 || !marketing2) {
        console.error('Required users not found. Please run seed-data.ts first.');
        return;
    }

    const campaigns = [
        {
            name: 'Mumbai Premium Properties Q1',
            description: 'Upscale properties in South Mumbai',
            status: 'active',
            platform: 'Google Ads',
            budget: 150000,
            spent: 98500,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-03-31'),
            impressions: 125000,
            clicks: 8500,
            leadsCount: 420,
            conversions: 78,
            assignedTo: { connect: [{ id: marketing1.id }, { id: marketing2.id }] },
        },
        {
            name: 'Pune Luxury Villas Campaign',
            description: 'Exclusive villa projects in West Pune',
            status: 'active',
            platform: 'Facebook',
            budget: 100000,
            spent: 67800,
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-04-30'),
            impressions: 98000,
            clicks: 6200,
            leadsCount: 280,
            conversions: 52,
            assignedTo: { connect: [{ id: marketing2.id }] },
        },
        {
            name: 'Bangalore Tech City',
            description: 'Properties near tech hubs in North Bangalore',
            status: 'paused',
            platform: 'Instagram',
            budget: 80000,
            spent: 45200,
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-03-15'),
            impressions: 72000,
            clicks: 4800,
            leadsCount: 190,
            conversions: 34,
            assignedTo: { connect: [{ id: marketing1.id }] },
        },
    ];

    for (const campaignData of campaigns) {
        const existing = await prisma.marketingCampaign.findFirst({ where: { name: campaignData.name } });
        if (!existing) {
            await prisma.marketingCampaign.create({ data: campaignData });
        } else {
            console.log(`Campaign ${campaignData.name} already exists.`);
        }
    }

    console.log('✅ Marketing campaigns seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
