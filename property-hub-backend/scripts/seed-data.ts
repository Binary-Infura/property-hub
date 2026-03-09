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

    // Super User with all roles
    console.log('Creating Super User with all roles...');
    const superUser = await prisma.user.upsert({
        where: { email: 'superuser@propertyhub.com' },
        update: {
            roles: { set: ['central-authority', 'broker', 'marketing-manager', 'consultant', 'buyer', 'property-partner', 'onboarding-manager', 'loan-adviser', 'visit-executive', 'influencer'] }
        },
        create: {
            email: 'superuser@propertyhub.com',
            firstName: 'Super',
            lastName: 'User',
            roles: ['central-authority', 'broker', 'marketing-manager', 'consultant', 'buyer', 'property-partner', 'onboarding-manager', 'loan-adviser', 'visit-executive', 'influencer'],
            status: 'active',
            passwordHash,
            agencyName: 'Prestige Builders',
            phone: '+919876543222',
        },
    });

    // Create all profiles for the super user
    await prisma.centralAuthorityProfile.upsert({
        where: { userId: superUser.id },
        update: {},
        create: {
            userId: superUser.id,
            department: 'Operations',
            accessLevel: 'Admin'
        }
    });

    await prisma.propertyPartnerProfile.upsert({
        where: { userId: superUser.id },
        update: {},
        create: {
            userId: superUser.id,
            companyName: 'Prestige Builders',
            companyAddress: '123 Builder Lane, Mumbai',
            isPremium: true
        }
    });

    await prisma.consultantProfile.upsert({
        where: { userId: superUser.id },
        update: {},
        create: {
            userId: superUser.id,
            specialization: ['Residential', 'Commercial', 'Investment'],
            experienceYears: 10
        }
    });

    await prisma.marketingManagerProfile.upsert({
        where: { userId: superUser.id },
        update: {},
        create: {
            userId: superUser.id,
            campaignBudgetLimit: 5000000
        }
    });

    await prisma.buyerProfile.upsert({
        where: { userId: superUser.id },
        update: {},
        create: {
            userId: superUser.id,
            budgetMin: 5000000,
            budgetMax: 100000000,
            preferredLocations: ['Mumbai', 'Pune', 'Bangalore', 'Delhi']
        }
    });

    // Use superUser for all role assignments
    const caUser = superUser;
    const ppUser = superUser;
    const consUser = superUser;
    const buyerUser = superUser;
    const loanAdviserUser = superUser;

    const marketingManagers = [superUser];

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
