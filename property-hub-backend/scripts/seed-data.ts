import { PrismaClient, ProjectStatus, ProjectType } from '@prisma/client';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Cities
    console.log('Creating Cities...');
    const cities = [
        { name: 'Mumbai', state: 'Maharashtra' },
        { name: 'Pune', state: 'Maharashtra' },
        { name: 'Bangalore', state: 'Karnataka' },
        { name: 'Delhi', state: 'Delhi' },
    ];

    for (const city of cities) {
        await prisma.city.upsert({
            where: { name: city.name },
            update: {},
            create: city,
        });
    }

    // 2. Regions (REMOVED)
    console.log('Skipping Regions...');

    // 3. Central Authority
    console.log('Creating Central Authority...');
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


    // 4. Regional Managers (REMOVED)
    console.log('Skipping Regional Managers...');

    // 5. Property Partner
    console.log('Creating Property Partner...');
    const ppEmail = 'property@propertyhub.com';
    const ppUser = await prisma.user.upsert({
        where: { email: ppEmail },
        update: { roles: ['property-partner'] },
        create: {
            email: ppEmail,
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

    // 5b. Onboarding Manager
    console.log('Creating Onboarding Manager...');
    const obEmail = 'onboard@propertyhub.com';
    await prisma.user.upsert({
        where: { email: obEmail },
        update: {
            roles: ['onboarding-manager'],
        },
        create: {
            email: obEmail,
            firstName: 'Onboarding',
            lastName: 'Manager',
            roles: ['onboarding-manager'],

            status: 'active',
            passwordHash,
        }
    });

    // 5c. Consultant
    console.log('Creating Consultant...');
    const consEmail = 'testconsultant@gmail.com';
    const consUser = await prisma.user.upsert({
        where: { email: consEmail },
        update: { roles: ['consultant'] },
        create: {
            email: consEmail,
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

    // 6. Properties
    console.log('Creating Properties...');
    await prisma.project.create({
        data: {
            name: 'Luxury Sea View Apartment',
            description: 'Beautiful 3BHK facing the sea',
            location: 'Worli, Mumbai',
            address: 'Worli Sea Face',
            price: 45000000,
            area: 1800,
            projectType: 'APARTMENT',
            status: 'PUBLISHED',
            onboardedById: ppUser.id,
            bedrooms: 3,
            bathrooms: 3,
            category: 'flat'
        }
    });

    await prisma.project.create({
        data: {
            name: 'Green Valley Plot',
            description: 'Lush green plot for villa',
            location: 'Lonavala, Pune',
            price: 8000000,
            area: 5000,
            projectType: 'PLOT',
            status: 'AVAILABLE',
            onboardedById: ppUser.id,
            category: 'plot'
        }
    });

    // 7. Commission Managers — removed (handled by central-authority)

    // 8. Marketing Managers
    console.log('Creating Marketing Managers...');
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
            update: {},
            create: {
                userId: user.id,
                campaignBudgetLimit: 1000000
            }
        });
    }

    // 9. Buyer
    console.log('Creating Buyer...');
    const buyerEmail = 'buyer@test.com';
    await prisma.user.upsert({
        where: { email: buyerEmail },
        update: {},
        create: {
            email: buyerEmail,
            firstName: 'Test',
            lastName: 'Buyer',
            roles: ['buyer'],

            status: 'active',
            passwordHash,
        }
    });

    // 10. Loan Adviser
    console.log('Creating Loan Adviser...');
    const loanEmail = 'loan@propertyhub.com';
    await prisma.user.upsert({
        where: { email: loanEmail },
        update: {},
        create: {
            email: loanEmail,
            firstName: 'Expert',
            lastName: 'Loaner',
            roles: ['loan-adviser'],

            status: 'active',
            passwordHash,
        }
    });

    // 11. Visit Executive
    console.log('Creating Visit Executive...');
    const visitEmail = 'visit@propertyhub.com';
    await prisma.user.upsert({
        where: { email: visitEmail },
        update: {},
        create: {
            email: visitEmail,
            firstName: 'Visit',
            lastName: 'Executive',
            roles: ['visit-executive'],

            status: 'active',
            passwordHash,
        }
    });

    // 12. Broker
    console.log('Creating Broker...');
    const cpEmail = 'cp@test.com';
    const cpUser = await prisma.user.upsert({
        where: { email: cpEmail },
        update: {},
        create: {
            email: cpEmail,
            firstName: 'Broker',
            lastName: 'Partner',
            roles: ['broker'],
            status: 'active',
            passwordHash,
        }
    });

    await (prisma as any).brokerProfile.upsert({
        where: { userId: cpUser.id },
        update: {},
        create: {
            userId: cpUser.id,
            agencyBusinessName: 'Top Brokerage',
            reraNumber: 'RERA12345',
            officeAddress: '456 Business Blvd, Mumbai'
        }
    });

    // 13. Banks
    console.log('Creating Banks...');
    const banks = [
        { name: 'HDFC Bank', percentage: 8.4 },
        { name: 'SBI Bank', percentage: 8.5 },
        { name: 'ICICI Bank', percentage: 8.75 },
        { name: 'Axis Bank', percentage: 8.65 },
        { name: 'Kotak Bank', percentage: 8.8 },
    ];

    for (const bank of banks) {
        await prisma.bank.upsert({
            where: { name: bank.name },
            update: {},
            create: bank,
        });
    }

    // 14. Default Reels
    console.log('Creating Default Reels...');

    // Delete any existing seed reels to avoid duplicates
    await prisma.reel.deleteMany({
        where: { userId: ppUser.id }
    });

    const defaultReels = [
        {
            title: 'Luxury Sea View Apartment - Worli, Mumbai',
            description: 'Step inside this stunning 3BHK sea-facing apartment in one of Mumbai\'s most iconic locations. Panoramic views, premium finishes, and world-class amenities await.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
        },
        {
            title: 'Green Valley Villa Plots - Lonavala, Pune',
            description: 'Build your dream home amidst nature. These lush green plots in Lonavala offer the perfect escape from city life with clear titles and RERA approved layout.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        },
        {
            title: 'Premium 2BHK Ready-to-Move - Bandra, Mumbai',
            description: 'No more waiting! This ready-to-move 2BHK in Bandra West is fully furnished with modular kitchen, wooden flooring, and a private balcony with stunning city views.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
        },
        {
            title: 'Exclusive Penthouse - Powai, Mumbai',
            description: 'The pinnacle of luxury living. This exclusive 4BHK penthouse overlooking Powai Lake features a private terrace, home theatre, and butler service in a gated community.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80',
        },
    ];

    for (const reel of defaultReels) {
        await prisma.reel.create({
            data: {
                ...reel,
                userId: ppUser.id,
            },
        });
    }

    console.log(`Seeded ${defaultReels.length} default reels.`);
    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
