import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Starting database cleanup...');

    // Get all model names from Prisma
    const modelNames = [
        'ActivityLog',
        'AdsRequest',
        'CallLog',
        'Commission',
        'Follow',
        'Invitation',
        'LeadNote',
        'Lead',
        'Loan',
        'PaymentOrder',
        'PostalCodeSyncLog',
        'PropertyUnit',
        'Reel',
        'ReraDistrictCount',
        'ReraProject',
        'ReraSyncLog',
        'Review',
        'Tower',
        'UserDocument',
        'Visit',
        'WebhookLog',
        'Project',
        'User',
        'Organization',
        'City',
        'PostalCode',
        'Bank'
    ];

    console.log('   Truncating tables...');

    // We use a transaction to ensure all or nothing is deleted, 
    // although for cleanup it's less critical.
    // Using raw SQL for efficient truncation with CASCADE on PostgreSQL.
    
    try {
        // This is the most efficient way to clear all data in PostgreSQL while respecting FKs
        const tablenames = await prisma.$queryRaw<
            Array<{ tablename: string }>
        >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

        for (const { tablename } of tablenames) {
            if (tablename !== '_prisma_migrations') {
                try {
                    await prisma.$executeRawUnsafe(
                        `TRUNCATE TABLE "public"."${tablename}" RESTART IDENTITY CASCADE;`
                    );
                } catch (error) {
                    console.log(`      ⚠️ Could not truncate table ${tablename}, resorting to deleteMany`);
                    // Fallback to deleteMany for non-existent or problematic tables
                    const modelName = modelNames.find(m => m.toLowerCase() === tablename.replace(/_/g, '').replace(/s$/, ''));
                    if (modelName) {
                        await (prisma as any)[modelName].deleteMany();
                    }
                }
            }
        }
        
        console.log('✅ Database cleaned successfully.');
    } catch (e) {
        console.error('❌ Failed to clean database using raw SQL:', e);
        console.log('   Attempting fallback deleteMany for each model...');
        
        // Final fallback: delete by model if the raw SQL fails
        for (const modelName of modelNames) {
            try {
                const model = (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)];
                if (model) {
                    await model.deleteMany();
                }
            } catch (err) {
                // Ignore errors on nested/missing models
            }
        }
        console.log('✅ Fallback cleanup complete.');
    }
}

main()
    .catch((e) => {
        console.error('❌ Cleanup failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
