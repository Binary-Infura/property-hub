import { 
    PrismaClient, 
    ProjectStatus, 
    ProjectType, 
    LeadStatus, 
    UserRole, 
    UserStatus, 
    OrganizationType, 
    UnitStatus,
    VisitStatus,
    CommissionStatus,
    BuyerLoanStatus,
    InstagramStatus,
    LeadNoteCategory,
    SubscriptionMode,
    InvitationStatus
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive database seed...');

    const passwordHash = await bcrypt.hash('password123', 10);
    const now = new Date();
    const future = new Date();
    future.setMonth(now.getMonth() + 6);
    const past = new Date();
    past.setMonth(now.getMonth() - 6);

    // --- 1. Cities ---
    console.log('   Creating Cities...');
    const citiesData = [
        { name: 'Mumbai', state: 'Maharashtra' },
        { name: 'Pune', state: 'Maharashtra' },
        { name: 'Bangalore', state: 'Karnataka' },
        { name: 'Delhi', state: 'Delhi' },
        { name: 'Hyderabad', state: 'Telangana' },
    ];

    for (const city of citiesData) {
        let existing = await prisma.city.findFirst({ where: { name: city.name } });
        if (existing) {
            await prisma.city.update({ where: { id: existing.id }, data: { active: true } });
        } else {
            await prisma.city.create({ data: { ...city, active: true } });
        }
    }
    const allCities = await prisma.city.findMany();
    const mumbai = allCities.find(c => c.name === 'Mumbai');
    const pune = allCities.find(c => c.name === 'Pune');

    // --- 2. Postal Codes ---
    console.log('   Creating Postal Codes...');
    const postalCodesData = [
        { code: '400018', officeName: 'Worli', district: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: '18.9986', longitude: '72.8174' },
        { code: '411001', officeName: 'Pune H.O', district: 'Pune', state: 'Maharashtra', country: 'India', latitude: '18.5204', longitude: '73.8567' },
        { code: '560001', officeName: 'Bangalore G.P.O.', district: 'Bangalore', state: 'Karnataka', country: 'India', latitude: '12.9716', longitude: '77.5946' },
    ];

    for (const pc of postalCodesData) {
        await prisma.postalCode.upsert({
            where: { code_officeName: { code: pc.code, officeName: pc.officeName } },
            update: {},
            create: pc,
        });
    }
    const worliPostalCode = await prisma.postalCode.findFirst({ where: { code: '400018' } });

    // --- 3. Organizations ---
    console.log('   Creating Organizations...');
    const platformOrg = await prisma.organization.upsert({
        where: { id: 'platform-org-id' },
        update: {},
        create: {
            id: 'platform-org-id',
            name: 'Builder Bus Platform',
            type: OrganizationType.PLATFORM,
            email: 'admin@propertyhub.com',
            phone: '+912200001111',
            address: 'Tech Park, Mumbai',
            isActive: true,
            isPremium: true,
            subscriptionMode: SubscriptionMode.PAID,
        }
    });

    const prestigeOrg = await prisma.organization.upsert({
        where: { id: 'prestige-org-id' },
        update: {},
        create: {
            id: 'prestige-org-id',
            name: 'Prestige Builders',
            type: OrganizationType.PROPERTY_PARTNER,
            email: 'contact@prestige.com',
            phone: '+919876543000',
            address: '123 Builder Lane, Mumbai',
            taxId: 'TAX123456',
            licenseNumber: 'RERA-MUM-123',
            isActive: true,
            isPremium: true,
            subscriptionMode: SubscriptionMode.PAID,
        }
    });


    // --- 4. Users ---
    console.log('   Creating Users based on test-users-credentials.md...');
    const users: any[] = [];

    // 4.1. Super User
    const superUser = await prisma.user.upsert({
        where: { email: 'superuser@propertyhub.com' },
        update: { 
            roles: [UserRole.CENTRAL_AUTHORITY], 
            activeRole: UserRole.CENTRAL_AUTHORITY, 
            organizationId: platformOrg.id,
            passwordHash
        },
        create: {
            email: 'superuser@propertyhub.com',
            firstName: 'Super',
            lastName: 'Admin',
            roles: [UserRole.CENTRAL_AUTHORITY],
            activeRole: UserRole.CENTRAL_AUTHORITY,
            status: UserStatus.ACTIVE,
            passwordHash,
            phone: '+919999999999',
            organizationId: platformOrg.id,
            onboardingStatus: 'completed',
            isEmailVerified: true,
            isPhoneVerified: true,
        },
    });
    users.push(superUser);

    // 4.2. Regular Role Users
    const rolesToSeed = [
        { role: UserRole.CENTRAL_AUTHORITY, email: 'central_authority@propertyhub.com', f: 'Central', l: 'Authority' },
        { role: UserRole.PROPERTY_PARTNER, email: 'property_partner@propertyhub.com', f: 'Property', l: 'Partner', orgId: prestigeOrg.id },
        { role: UserRole.BUYER, email: 'buyer@propertyhub.com', f: 'Test', l: 'Buyer' },
        { role: UserRole.LOAN_PARTNER, email: 'loan_partner@propertyhub.com', f: 'Loan', l: 'Partner' },
        { role: UserRole.BROKER, email: 'broker@propertyhub.com', f: 'Test', l: 'Broker' },
        { role: UserRole.VISIT_EXECUTIVE, email: 'visit_executive@propertyhub.com', f: 'Visit', l: 'Executive' },
        { role: UserRole.CENTRAL_AUTHORITY, email: 'onboarding_manager@propertyhub.com', f: 'Onboarding', l: 'Manager' },
    ];

    for (const r of rolesToSeed) {
        const user = await prisma.user.upsert({
            where: { email: r.email },
            update: { 
                activeRole: r.role,
                organizationId: r.orgId || platformOrg.id,
                passwordHash
            },
            create: {
                email: r.email,
                firstName: r.f,
                lastName: r.l,
                roles: [r.role],
                activeRole: r.role,
                status: UserStatus.ACTIVE,
                passwordHash,
                onboardingStatus: 'completed',
                organizationId: r.orgId || platformOrg.id,
                isEmailVerified: true,
            }
        });
        users.push(user);
    }

    // Helper references for subsequent seed steps
    const ppUser = users.find(u => u.activeRole === UserRole.PROPERTY_PARTNER);
    const visitExecutive = users.find(u => u.activeRole === UserRole.VISIT_EXECUTIVE);
    const buyerUser = users.find(u => u.activeRole === UserRole.BUYER);

    // --- 5. Projects ---
    console.log('   Creating Projects...');
    const projectsData = [
        {
            id: 'f8b47853-f1ed-445f-a3f2-2812f563dd99',
            name: 'Prestige Falcon City',
            description: 'Luxury residential project with world-class amenities.',
            addressRecord: {
                create: {
                    line1: 'Sy No 56/1, Kanakapura Road',
                    cityId: allCities.find(c => c.name === 'Bangalore')?.id as string,
                    pincode: '560062',
                }
            },
            price: 12500000.00,
            area: 1600.00,
            bedrooms: 3,
            bathrooms: 3,
            projectType: ProjectType.APARTMENT,
            status: ProjectStatus.APPROVED,
            category: 'Premium',
            onboardedBy: { connect: { id: ppUser.id } },
            images: ['https://images.unsplash.com/photo-1545324418-f1d3ac157304?w=800'],
            totalTowers: 5,
            totalUnits: 450,
            amenities: ['Swiming Pool', 'Gym', 'Clubhouse', 'Yoga Deck'],
            highlights: ['Near Metro', 'Premium Finishes', 'Forest View'],
        },
        {
            id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
            name: 'Prestige High Fields',
            description: 'Modern apartments in the heart of the business district.',
            addressRecord: {
                create: {
                    line1: 'ISB Road, Gachibowli',
                    cityId: allCities.find(c => c.name === 'Hyderabad')?.id as string,
                }
            },
            price: 9500000.00,
            area: 1400.00,
            bedrooms: 2,
            bathrooms: 2,
            projectType: ProjectType.APARTMENT,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            category: 'Residential',
            onboardedBy: { connect: { id: ppUser.id } },
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
            totalTowers: 10,
            totalUnits: 1200,
        },
        {
            id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
            name: 'Worli Sky Villa',
            description: 'Ultra-luxurious sea facing villas.',
            addressRecord: {
                create: {
                    line1: 'Worli Sea Face',
                    cityId: mumbai?.id as string,
                    pincode: worliPostalCode?.code,
                }
            },
            price: 85000000.00,
            area: 4500.00,
            bedrooms: 5,
            bathrooms: 6,
            projectType: ProjectType.VILLA,
            status: ProjectStatus.APPROVED,
            category: 'Luxury',
            onboardedBy: { connect: { id: superUser.id } },
            images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
            totalTowers: 1,
            totalUnits: 10,
        }
    ];

    const projects: any[] = [];
    for (const p of projectsData) {
        let project = await prisma.project.findFirst({ where: { name: p.name } });
        if (!project) {
            project = await prisma.project.create({ data: p });
        }
        projects.push(project);
    }

    // --- 6. Towers & Units ---
    console.log('   Creating Towers and Units...');
    for (const project of projects) {
        if (project.projectType === ProjectType.APARTMENT) {
            for (let i = 1; i <= 2; i++) {
                const towerName = `Tower ${String.fromCharCode(64 + i)}`;
                let tower = await prisma.tower.findFirst({ 
                    where: { name: towerName, projectId: project.id } 
                });
                
                if (!tower) {
                    tower = await prisma.tower.create({
                        data: {
                            name: towerName,
                            projectId: project.id,
                            totalFloors: 20,
                        }
                    });
                }

                for (let floor = 1; floor <= 2; floor++) {
                    for (let u = 1; u <= 2; u++) {
                        const unitNumber = `${floor}0${u}`;
                        const existingUnit = await prisma.propertyUnit.findFirst({
                            where: { 
                                projectId: project.id, 
                                towerId: tower.id, 
                                unitNumber: unitNumber 
                            }
                        });

                        if (!existingUnit) {
                            await prisma.propertyUnit.create({
                                data: {
                                    projectId: project.id,
                                    towerId: tower.id,
                                    unitNumber: unitNumber,
                                    floor: floor,
                                    type: `${floor+1}BHK`,
                                    area: 1200 + (floor * 100),
                                    price: project.price.toNumber() + (floor * 500000),
                                    status: UnitStatus.AVAILABLE,
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    // --- 7. Banks & Loans ---
    console.log('   Creating Banks and Loans...');
    const banksData = [
        { name: 'HDFC Bank', percentage: 8.4, logoUrl: 'https://logo.clearbit.com/hdfcbank.com' },
        { name: 'SBI Bank', percentage: 8.5, logoUrl: 'https://logo.clearbit.com/sbi.co.in' },
        { name: 'ICICI Bank', percentage: 8.75, logoUrl: 'https://logo.clearbit.com/icicibank.com' },
    ];

    const banks: any[] = [];
    for (const bank of banksData) {
        const b = await prisma.bank.upsert({
            where: { name: bank.name },
            update: {},
            create: bank,
        });
        banks.push(b);
    }

    // --- 8. Marketing Campaigns ---
    console.log('   Creating Marketing Campaigns...');
    let campaign = await prisma.marketingCampaign.findFirst({ where: { name: 'Diwali Premium Dhamaka' } });
    if (!campaign) {
        campaign = await prisma.marketingCampaign.create({
            data: {
                name: 'Diwali Premium Dhamaka',
                description: 'Exclusive Diwali offers on premium apartments',
                status: 'ACTIVE',
                platform: 'Facebook',
                budget: 500000,
                spent: 120000,
                startDate: past,
                endDate: future,
                impressions: 45000,
                clicks: 3200,
                leadsCount: 156,
                assignedTo: { connect: [{ id: superUser.id }] }
            }
        });
    }

    // --- 9. Leads & Activities ---
    console.log('   Creating Leads, Notes, Visits, and Calls...');
    const leadNames = ['Rahul Sharma', 'Ananya Singh', 'David Miller', 'Priya Patel'];
    const leads: any[] = [];

    for (let i = 0; i < leadNames.length; i++) {
        const phone = `+91980000000${i}`;
        let lead = await prisma.lead.findFirst({ where: { phone } });
        
        if (!lead) {
            lead = await prisma.lead.create({
                data: {
                    name: leadNames[i],
                    email: `${leadNames[i].toLowerCase().replace(' ', '.')}@example.com`,
                    phone,
                    status: i % 2 === 0 ? LeadStatus.NEW : LeadStatus.QUALIFIED,
                    source: 'Facebook Ad',
                    notes: 'Interested in 3BHK high-rise units.',
                    projectId: projects[i % projects.length].id,
                    campaignId: campaign.id,
                    assignedTo: superUser.id,
                }
            });
        }
        leads.push(lead);

        // Lead Notes
        const existingNote = await prisma.leadNote.findFirst({ where: { leadId: lead.id, content: 'Expressed strong interest during first call.' } });
        if (!existingNote) {
            await prisma.leadNote.create({
                data: {
                    leadId: lead.id,
                    authorId: superUser.id,
                    content: 'Expressed strong interest during first call.',
                    category: LeadNoteCategory.GENERAL
                }
            });
        }

        // Visits
        const existingVisit = await prisma.visit.findFirst({ where: { leadId: lead.id, status: VisitStatus.SCHEDULED } });
        if (!existingVisit) {
            await prisma.visit.create({
                data: {
                    leadId: lead.id,
                    scheduledAt: future,
                    status: VisitStatus.SCHEDULED,
                    visitExecutiveId: visitExecutive?.id,
                    notes: 'Pick up requested from Metro station.'
                }
            });
        }

        // Call Logs
        const existingCall = await prisma.callLog.findFirst({ where: { leadId: lead.id } });
        if (!existingCall) {
            await prisma.callLog.create({
                data: {
                    leadId: lead.id,
                    status: 'COMPLETED',
                    duration: 450,
                    recordingUrl: 'https://storage.provider.com/calls/rec_123.mp3',
                    startTime: past,
                    endTime: new Date(past.getTime() + 450000),
                }
            });
        }

        // Buyer Loan Applications (Flow 1)
        if (i === 0) {
            const existingBuyerLoan = await prisma.buyerLoanApplication.findFirst({ where: { leadId: lead.id } });
            if (!existingBuyerLoan) {
                await prisma.buyerLoanApplication.create({
                    data: {
                        leadId: lead.id,
                        bankId: banks[0].id,
                        loanAmount: 8000000,
                        eligibleAmount: 9000000,
                        status: BuyerLoanStatus.APPROVED,
                        notes: 'Credit check cleared.'
                    }
                });
            }
        }
    }

    // --- 10. Commissions ---
    console.log('   Creating Commissions...');
    const existingCommission = await prisma.commission.findFirst({ where: { projectId: projects[0].id, agentId: superUser.id } });
    if (!existingCommission) {
        await prisma.commission.create({
            data: {
                amount: 150000,
                percentage: 2.0,
                agentId: superUser.id,
                projectId: projects[0].id,
                status: CommissionStatus.PENDING,
            }
        });
    }

    // --- 11. Ads Requests ---
    console.log('   Creating Ads Requests...');
    const existingAdsReq = await prisma.adsRequest.findFirst({ where: { title: 'Holi Weekend Special', requestedById: ppUser.id } });
    if (!existingAdsReq) {
        await prisma.adsRequest.create({
            data: {
                title: 'Holi Weekend Special',
                description: 'Requesting 2% extra discount banner for Holi.',
                status: 'PENDING',
                priority: 'HIGH',
                requestedById: ppUser.id,
                projectId: projects[0].id,
                budget: 50000,
                platform: 'Instagram'
            }
        });
    }

    // --- 12. Reels ---
    console.log('   Creating Reels...');
    const existingReel = await prisma.reel.findFirst({ where: { title: 'Morning View from Falcon City' } });
    if (!existingReel) {
        await prisma.reel.create({
            data: {
                title: 'Morning View from Falcon City',
                description: 'Waking up to this view every day! #LuxuryLiving',
                videoUrl: 'https://v.videvo.net/video/free/2014-12/small_watermarked/Raindrops_Files_01_preview.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-f1d3ac157304?w=400',
                userId: ppUser.id,
                projectId: projects[0].id,
                instagramStatus: InstagramStatus.PUBLISHED,
                publishToOfficialInstagram: true,
            }
        });
    }

    // --- 13. Reviews ---
    console.log('   Creating Reviews...');
    const existingReview = await prisma.review.findFirst({ where: { authorId: buyerUser.id, authorName: 'Rahul Sharma' } });
    if (!existingReview) {
        await prisma.review.create({
            data: {
                content: 'Prestige Builders always deliver on time. Great experience!',
                rating: 5,
                authorId: buyerUser.id,
                authorName: 'Rahul Sharma',
                authorRole: 'Happy Homeowner',
                isApproved: true,
                showOnHomepage: true,
            }
        });
    }

    // --- 14. User Documents ---
    console.log('   Creating User Documents...');
    const existingDoc = await prisma.userDocument.findFirst({ where: { userId: superUser.id, name: 'Corporate License' } });
    if (!existingDoc) {
        await prisma.userDocument.create({
            data: {
                userId: superUser.id,
                name: 'Corporate License',
                category: 'Legal',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                status: 'verified',
            }
        });
    }

    // --- 15. Activity Logs ---
    console.log('   Creating Activity Logs...');
    const existingActivity = await prisma.activityLog.findFirst({ where: { userId: superUser.id, action: 'APPROVE', target: projects[0].name } });
    if (!existingActivity) {
        await prisma.activityLog.create({
            data: {
                userId: superUser.id,
                type: 'PROJECT',
                action: 'APPROVE',
                target: projects[0].name,
                details: { projectId: projects[0].id, reason: 'All documents verified' },
            }
        });
    }

    // --- 16. Follows ---
    console.log('   Creating Follows...');
    await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: buyerUser.id, followingId: ppUser.id } },
        update: {},
        create: {
            followerId: buyerUser.id,
            followingId: ppUser.id,
        }
    });

    // --- 17. RERA & Sync Logs ---
    console.log('   Creating RERA and Sync data...');
    await prisma.reraProject.upsert({
        where: { reraNumber: 'PRM/KA/RERA/1251/310/PR/170915/000213' },
        update: {},
        create: {
            state: 'Karnataka',
            reraNumber: 'PRM/KA/RERA/1251/310/PR/170915/000213',
            projectName: 'Prestige Falcon City',
            promoterName: 'Prestige Estate Projects Ltd',
            status: 'Approved',
            district: 'Bangalore South',
            registrationDate: past,
            completionDate: future,
        }
    });

    await prisma.reraSyncLog.create({
        data: {
            state: 'Karnataka',
            status: 'COMPLETED',
            projectsScraped: 120,
            startedAt: past,
            completedAt: now,
        }
    });

    await prisma.reraDistrictCount.upsert({
        where: { state_district: { state: 'Karnataka', district: 'Bangalore South' } },
        update: {},
        create: {
            state: 'Karnataka',
            district: 'Bangalore South',
            projectCount: 450,
        }
    });

    await prisma.postalCodeSyncLog.create({
        data: {
            status: 'SUCCESS',
            recordsImported: 154000,
            totalRecords: 154782,
            startedAt: past,
            completedAt: now,
        }
    });

    // --- 19. Payment Orders ---
    console.log('   Creating Payment Orders...');
    await prisma.paymentOrder.upsert({
        where: { razorpayOrderId: 'order_ABC123' },
        update: {},
        create: {
            userId: buyerUser.id,
            amount: 5000.00,
            currency: 'INR',
            status: 'SUCCESS',
            razorpayOrderId: 'order_ABC123',
            razorpayPaymentId: 'pay_ABC123',
            receipt: 'receipt_123',
        }
    });

    // --- 20. Invitations ---
    console.log('   Creating Invitations...');
    const existingInvite = await prisma.invitation.findFirst({ where: { email: 'newbroker@example.com' } });
    if (!existingInvite) {
        await prisma.invitation.create({
            data: {
                email: 'newbroker@example.com',
                roles: [UserRole.BROKER],
                token: uuidv4(),
                status: InvitationStatus.PENDING,
                invitedById: superUser.id,
                expiresAt: future,
            }
        });
    }

    // --- 21. Webhook Logs ---
    console.log('   Creating Webhook Logs...');
    const existingWebhook = await prisma.webhookLog.findFirst({ where: { endpoint: '/v1/payments/razorpay', responseStatus: 200 } });
    if (!existingWebhook) {
        await prisma.webhookLog.create({
            data: {
                method: 'POST',
                endpoint: '/v1/payments/razorpay',
                requestPayload: { event: 'payment.captured', payload: {} },
                responseStatus: 200,
                executionTimeMs: 124,
            }
        });
    }

    console.log('✅ Seeding completed successfully. All tables and fields populated.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

