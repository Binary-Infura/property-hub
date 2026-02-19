import { PrismaClient, PropertyStatus, PropertyType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Locations
    console.log('Creating Locations...');
    const locations = [
        { continent: 'Asia', country: 'India', state: 'Maharashtra', city: 'Mumbai' },
        { continent: 'Asia', country: 'India', state: 'Maharashtra', city: 'Pune' },
        { continent: 'Asia', country: 'India', state: 'Karnataka', city: 'Bangalore' },
        { continent: 'Asia', country: 'India', state: 'Delhi', city: 'New Delhi' },
    ];

    for (const loc of locations) {
        await prisma.location.upsert({
            where: {
                continent_country_state_city: loc,
            },
            update: {},
            create: loc,
        });
    }

    // 2. Regions
    console.log('Creating Regions...');
    const regionsData = [
        { name: 'Mumbai South', code: 'MH-MUM-SO-01', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        { name: 'Pune West', code: 'MH-PUN-WE-01', city: 'Pune', state: 'Maharashtra', country: 'India' },
        { name: 'Bangalore North', code: 'KA-BLR-NO-01', city: 'Bangalore', state: 'Karnataka', country: 'India' },
        { name: 'Delhi NCR', code: 'DL-NCR-01', city: 'New Delhi', state: 'Delhi', country: 'India' },
    ];

    const createdRegions: any[] = [];
    for (const r of regionsData) {
        // Find location first
        const location = await prisma.location.findFirst({
            where: { city: r.city, state: r.state }
        });

        const region = await prisma.region.upsert({
            where: { code: r.code },
            update: {},
            create: {
                name: r.name,
                code: r.code,
                active: true,

                locationId: location?.id
            },
        });
        createdRegions.push(region);
    }

    // 3. Central Authority
    console.log('Creating Central Authority...');
    const caUser = await prisma.user.upsert({
        where: { email: 'central@propertyhub.com' },
        update: {},
        create: {
            email: 'central@propertyhub.com',
            firstName: 'Central',
            lastName: 'Authority',
            role: 'central-authority',
            keycloakId: uuidv4(),
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
        update: { role: 'property-partner' },
        create: {
            email: ppEmail,
            firstName: 'Property',
            lastName: 'Partner',
            role: 'property-partner',
            keycloakId: uuidv4(),
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
            role: 'onboarding-manager',
            regions: { connect: { id: createdRegions[0].id } }
        },
        create: {
            email: obEmail,
            firstName: 'Onboarding',
            lastName: 'Manager',
            role: 'onboarding-manager',
            keycloakId: uuidv4(),
            status: 'active',
            passwordHash,
            regions: { connect: { id: createdRegions[0].id } }
        }
    });

    // 5c. Consultant
    console.log('Creating Consultant...');
    const consEmail = 'testconsultant@gmail.com';
    const consUser = await prisma.user.upsert({
        where: { email: consEmail },
        update: { role: 'consultant' },
        create: {
            email: consEmail,
            firstName: 'Test',
            lastName: 'Consultant',
            role: 'consultant',
            keycloakId: uuidv4(),
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
    await prisma.property.create({
        data: {
            name: 'Luxury Sea View Apartment',
            description: 'Beautiful 3BHK facing the sea',
            location: 'Worli, Mumbai',
            address: 'Worli Sea Face',
            price: 45000000,
            area: 1800,
            propertyType: 'APARTMENT',
            status: 'PUBLISHED',
            regionId: createdRegions[0].id,
            onboardedById: ppUser.id,
            bedrooms: 3,
            bathrooms: 3,
            category: 'flat'
        }
    });

    await prisma.property.create({
        data: {
            name: 'Green Valley Plot',
            description: 'Lush green plot for villa',
            location: 'Lonavala, Pune',
            price: 8000000,
            area: 5000,
            propertyType: 'PLOT',
            status: 'AVAILABLE',
            regionId: createdRegions[1].id,
            onboardedById: ppUser.id,
            category: 'plot'
        }
    });

    // 7. Commission Managers
    console.log('Creating Commission Managers...');
    for (let i = 1; i <= 2; i++) {
        const user = await prisma.user.upsert({
            where: { email: `finance${i}@propertyhub.com` },
            update: {},
            create: {
                email: `finance${i}@propertyhub.com`,
                firstName: 'Finance',
                lastName: `Manager ${i}`,
                role: 'commission-manager',
                keycloakId: uuidv4(),
                status: 'active',
                passwordHash,
            }
        });

        await prisma.commissionManagerProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                paymentAuthorityLimit: 500000
            }
        });
    }

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
                role: 'marketing-manager',
                keycloakId: uuidv4(),
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
            role: 'buyer',
            keycloakId: uuidv4(),
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
            role: 'loan-adviser',
            keycloakId: uuidv4(),
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
            role: 'visit-executive',
            keycloakId: uuidv4(),
            status: 'active',
            passwordHash,
        }
    });

    // 12. DSA
    console.log('Creating DSA...');
    const cpEmail = 'cp@test.com';
    const cpUser = await prisma.user.upsert({
        where: { email: cpEmail },
        update: {},
        create: {
            email: cpEmail,
            firstName: 'Direct Selling',
            lastName: 'Agent',
            role: 'dsa',
            keycloakId: uuidv4(),
            status: 'active',
            passwordHash,
        }
    });

    await (prisma as any).dsaProfile.upsert({
        where: { userId: cpUser.id },
        update: {},
        create: {
            userId: cpUser.id,
            agencyBusinessName: 'Top DSA Agency',
            reraNumber: 'RERA12345',
            officeAddress: '456 Business Blvd, Mumbai'
        }
    });

    console.log('✅ Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
