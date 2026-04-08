import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const growthPartners = [
    {
      firstName: 'Alex',
      lastName: 'Rivers',
      email: 'alex.influencer@example.com',
      phone: '9876543210',
      profileData: {
        type: 'Influencer',
        platforms: ['Instagram', 'TikTok'],
        followers: '150k+',
        startingPrice: 5000,
        rating: 4.8,
        bio: 'Real estate influencer specializing in luxury villas and modern apartments. 5+ years of content creation.',
        portfolio: [
          { title: 'Luxury Villa Tour', url: 'https://example.com/p1' },
          { title: 'First-time Homebuyer Tips', url: 'https://example.com/p2' }
        ],
        reviews: [
          { author: 'PropGroup', comment: 'Great engagement!', rating: 5 },
          { author: 'HomeStars', comment: 'Very professional.', rating: 4 }
        ]
      }
    },
    {
      firstName: 'Skyline',
      lastName: 'Media Agency',
      email: 'contact@skylinemedia.com',
      phone: '9876543211',
      profileData: {
        type: 'Agency',
        platforms: ['Meta Ads', 'Google Ads', 'YouTube'],
        followers: 'B2B/B2C',
        startingPrice: 25000,
        rating: 4.9,
        bio: 'Full-service digital marketing agency for real estate. We manage over $1M in monthly ad spend.',
        portfolio: [
          { title: 'Project X Launch', url: 'https://example.com/p3' }
        ],
        reviews: [
          { author: 'Modern Living', comment: 'ROI was amazing!', rating: 5 }
        ]
      }
    },
    {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.freelance@example.com',
      phone: '9876543212',
      profileData: {
        type: 'Freelancer',
        platforms: ['LinkedIn', 'Google Ads'],
        followers: '10k+',
        startingPrice: 8000,
        rating: 4.7,
        bio: 'Performance marketer focused on lead generation for property developers.',
        portfolio: [
          { title: 'Lead Gen Campaign', url: 'https://example.com/p4' }
        ],
        reviews: [
          { author: 'Alpha Built', comment: 'Quality leads only.', rating: 5 }
        ]
      }
    },
    {
        firstName: 'Damon',
        lastName: 'Visuals',
        email: 'damon@visuals.com',
        phone: '9876543213',
        profileData: {
          type: 'Agency',
          platforms: ['Instagram', 'YouTube', 'TikTok'],
          followers: '500k Total',
          startingPrice: 15000,
          rating: 4.6,
          bio: 'Specialists in 4K cinematic property tours and aerial videography.',
          portfolio: [],
          reviews: []
        }
      }
  ];

  console.log('Seeding growth partners...');

  for (const partner of growthPartners) {
    await prisma.user.upsert({
      where: { email: partner.email },
      update: {},
      create: {
        ...partner,
        passwordHash,
        roles: [UserRole.GROWTH_PARTNER],
        activeRole: UserRole.GROWTH_PARTNER,
        status: UserStatus.ACTIVE,
        onboardingStatus: 'completed'
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
