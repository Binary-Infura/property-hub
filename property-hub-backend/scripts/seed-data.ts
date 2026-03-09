import { PrismaClient, ProjectStatus, ProjectType, LeadStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed (Single Source of Truth)...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Cities
    console.log('Creating Cities...');
    const citiesData = [
        { name: 'Mumbai', state: 'Maharashtra' },
        { name: 'Pune', state: 'Maharashtra' },
        { name: 'Bangalore', state: 'Karnataka' },
        { name: 'Delhi', state: 'Delhi' },
    ];

    for (const city of citiesData) {
        await prisma.city.upsert({
            where: { name: city.name },
            update: {},
            create: city,
        });
    }

    const mumbai = await prisma.city.findFirst({ where: { name: 'Mumbai' } });
    const pune = await prisma.city.findFirst({ where: { name: 'Pune' } });

    // 2. Users & Profiles
    console.log('Creating Users and Profiles...');

    const caUser = await prisma.user.upsert({
        where: { email: 'central@propertyhub.com' },
        update: {},
        create: {
            email: 'central@propertyhub.com',
            firstName: 'Central',
            lastName: 'Authority',
            roles: ['central-authority'],
            status: 'active',
            passwordHash,
        },
    });

    await prisma.centralAuthorityProfile.upsert({
        where: { userId: caUser.id },
        update: {},
        create: {
            userId: caUser.id,
            department: 'Operations',
            accessLevel: 'Admin'
        }
    });

    const ppUser = await prisma.user.upsert({
        where: { email: 'property@propertyhub.com' },
        update: { roles: { set: ['property-partner'] } },
        create: {
            email: 'property@propertyhub.com',
            firstName: 'Property',
            lastName: 'Partner',
            roles: ['property-partner'],
            status: 'active',
            agencyName: 'Prestige Builders',
            passwordHash,
        }
    });

    await prisma.propertyPartnerProfile.upsert({
        where: { userId: ppUser.id },
        update: {},
        create: {
            userId: ppUser.id,
            companyName: 'Prestige Builders',
            companyAddress: '123 Builder Lane, Mumbai',
            isPremium: true
        }
    });

    const consUser = await prisma.user.upsert({
        where: { email: 'testconsultant@gmail.com' },
        update: { roles: { set: ['consultant'] } },
        create: {
            email: 'testconsultant@gmail.com',
            firstName: 'Test',
            lastName: 'Consultant',
            roles: ['consultant'],
            status: 'active',
            passwordHash,
        }
    });

    await prisma.consultantProfile.upsert({
        where: { userId: consUser.id },
        update: {},
        create: {
            userId: consUser.id,
            specialization: ['Residential'],
            experienceYears: 5
        }
    });

    const marketingManagers = [];
    for (let i = 1; i <= 2; i++) {
        const user = await prisma.user.upsert({
            where: { email: `marketing${i}@propertyhub.com` },
            update: {},
            create: {
                email: `marketing${i}@propertyhub.com`,
                firstName: 'Marketing',
                lastName: `Head ${i}`,
                roles: ['marketing-manager'],
                status: 'active',
                passwordHash,
            }
        });

        await prisma.marketingManagerProfile.upsert({
            where: { userId: user.id },
            update: {
                campaignBudgetLimit: 1000000
            },
            create: {
                userId: user.id,
                campaignBudgetLimit: 1000000
            }
        });
        marketingManagers.push(user);
    }

    const buyerUser = await prisma.user.upsert({
        where: { email: 'buyer@test.com' },
        update: {},
        create: {
            email: 'buyer@test.com',
            firstName: 'Test',
            lastName: 'Buyer',
            roles: ['buyer'],
            status: 'active',
            passwordHash,
        }
    });

    await prisma.buyerProfile.upsert({
        where: { userId: buyerUser.id },
        update: {},
        create: {
            userId: buyerUser.id,
            budgetMin: 5000000,
            budgetMax: 20000000,
            preferredLocations: ['Mumbai', 'Pune']
        }
    });

    const loanAdviserUser = await prisma.user.upsert({
        where: { email: 'loanadviser@propertyhub.com' },
        update: { roles: { set: ['loan-adviser'] } },
        create: {
            email: 'loanadviser@propertyhub.com',
            firstName: 'Finance',
            lastName: 'Expert',
            roles: ['loan-adviser'],
            status: 'active',
            passwordHash,
            phone: '+919876543222',
        }
    });

    // We can also create a profile for loan adviser if it exists, or just assign city allocations if needed.
    // Assuming no specific profile table is strictly required or we just use user table roles.

    // 3. Properties
    console.log('Creating Properties...');
    const projectsData = [
        {
            name: 'Luxury Sea View Apartment',
            description: 'Beautiful 3BHK facing the sea',
            location: 'Worli, Mumbai',
            address: 'Worli Sea Face',
            price: 45000000,
            area: 1800,
            projectType: ProjectType.APARTMENT,
            status: ProjectStatus.PUBLISHED,
            bedrooms: 3,
            bathrooms: 3,
            category: 'flat',
            cityId: mumbai?.id,
            onboardedById: ppUser.id
        },
        {
            name: 'Green Valley Plot',
            description: 'Lush green plot for villa',
            location: 'Lonavala, Pune',
            price: 8000000,
            area: 5000,
            projectType: ProjectType.PLOT,
            status: ProjectStatus.AVAILABLE,
            category: 'plot',
            cityId: pune?.id,
            onboardedById: ppUser.id
        }
    ];

    for (const p of projectsData) {
        const existing = await prisma.project.findFirst({ where: { name: p.name } });
        if (!existing) {
            await prisma.project.create({ data: p });
        }
    }

    const seaViewProj = await prisma.project.findFirst({ where: { name: 'Luxury Sea View Apartment' } });
    const valleyPlotProj = await prisma.project.findFirst({ where: { name: 'Green Valley Plot' } });

    // 4. Banks
    console.log('Creating Banks...');
    const banksData = [
        { name: 'HDFC Bank', percentage: 8.4 },
        { name: 'SBI Bank', percentage: 8.5 },
        { name: 'ICICI Bank', percentage: 8.75 },
    ];

    for (const bank of banksData) {
        await prisma.bank.upsert({
            where: { name: bank.name },
            update: {},
            create: bank,
        });
    }

    // 5. Reels
    console.log('Creating Reels...');

    if (seaViewProj && valleyPlotProj) {
        const reelItems = [
            {
                title: 'Luxury Sea View Apartment - Worli, Mumbai',
                description: 'Step inside this stunning 3BHK sea-facing apartment.',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
                projectId: seaViewProj.id
            },
            {
                title: 'Green Valley Villa Plots - Lonavala, Pune',
                description: 'Build your dream home amidst nature.',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
                projectId: valleyPlotProj.id
            },
        ];

        for (const item of reelItems) {
            const existing = await prisma.reel.findFirst({ where: { title: item.title } });
            if (!existing) {
                const { projectId, ...rest } = item;
                await prisma.reel.create({
                    data: {
                        ...rest,
                        user: { connect: { id: ppUser.id } },
                        project: { connect: { id: projectId } }
                    },
                });
            }
        }
    }

    // 6. Marketing Campaigns
    console.log('Creating Marketing Campaigns...');
    const curCampaignData = {
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
    };

    const campaign = await prisma.marketingCampaign.findFirst({ where: { name: curCampaignData.name } });
    let activeCampaign;
    if (!campaign) {
        activeCampaign = await prisma.marketingCampaign.create({
            data: {
                ...curCampaignData,
                assignedTo: { connect: marketingManagers.map(m => ({ id: m.id })) }
            }
        });
    } else {
        activeCampaign = campaign;
    }

    // 7. Leads
    console.log('Creating Leads...');
    const leadsData = [
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+919876543210',
            status: LeadStatus.NEW,
            source: 'Google Ads',
            notes: 'Interested in sea view apartments in Worli',
            projectId: seaViewProj?.id,
            campaignId: activeCampaign?.id,
            assignedTo: consUser.id
        },
        {
            name: 'Sarah Smith',
            email: 'sarah.smith@example.com',
            phone: '+919876543211',
            status: LeadStatus.FOLLOW_UP_STARTED,
            source: 'Facebook',
            notes: 'Needs info about plot registration in Pune',
            projectId: valleyPlotProj?.id,
            assignedTo: consUser.id
        },
        {
            name: 'Michael Brown',
            phone: '+919876543212',
            status: LeadStatus.VISITING,
            source: 'Referral',
            notes: 'Wants to schedule a site visit next Sunday',
            projectId: seaViewProj?.id,
            assignedTo: consUser.id
        }
    ];

    for (const l of leadsData) {
        const existing = await prisma.lead.findFirst({ where: { phone: l.phone, name: l.name } });
        if (!existing) {
            await prisma.lead.create({ data: l });
        }
    }

    // 8. User Documents (New Persistent Data)
    console.log('Creating User Documents...');
    const dummyUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const docsToSeed = [
        { name: 'Aadhaar Card', category: 'identity', url: dummyUrl, status: 'verified' },
        { name: 'PAN Card', category: 'identity', url: dummyUrl, status: 'verified' }
    ];

    for (const d of docsToSeed) {
        const existing = await prisma.userDocument.findFirst({
            where: { userId: buyerUser.id, name: d.name }
        });
        if (!existing) {
            await prisma.userDocument.create({
                data: {
                    ...d,
                    user: { connect: { id: buyerUser.id } }
                }
            });
        }
    }

    console.log('✅ Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
