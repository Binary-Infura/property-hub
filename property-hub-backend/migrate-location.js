const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log('--- Starting Location Migration ---');

    // 1. Migrate Regions
    const regions = await prisma.region.findMany();
    console.log(`Processing ${regions.length} regions...`);

    for (const region of regions) {
        if (!region.city || !region.state || !region.country || !region.continent) {
            console.log(`Skipping region ${region.code} - missing geographical data`);
            continue;
        }

        const location = await prisma.location.upsert({
            where: {
                continent_country_state_city: {
                    continent: region.continent,
                    country: region.country,
                    state: region.state,
                    city: region.city
                }
            },
            update: {},
            create: {
                continent: region.continent,
                country: region.country,
                state: region.state,
                city: region.city
            }
        });

        await prisma.region.update({
            where: { id: region.id },
            data: { locationId: location.id }
        });
        console.log(`Region ${region.code} linked to location ${location.id}`);
    }

    // 2. Migrate Properties
    const properties = await prisma.property.findMany({
        include: { region: true }
    });
    console.log(`Processing ${properties.length} properties...`);

    for (const prop of properties) {
        let geo = {
            continent: 'Asia', // Default fallback
            country: 'India',
            state: 'Rajasthan', // Based on project context (Nathdwara/Udaipur)
            city: prop.city || 'Udaipur'
        };

        // If linked to a region with data, use that
        if (prop.region && prop.region.city) {
            geo = {
                continent: prop.region.continent || geo.continent,
                country: prop.region.country || geo.country,
                state: prop.region.state || geo.state,
                city: prop.region.city || geo.city
            };
        }

        const location = await prisma.location.upsert({
            where: {
                continent_country_state_city: {
                    continent: geo.continent,
                    country: geo.country,
                    state: geo.state,
                    city: geo.city
                }
            },
            update: {},
            create: geo
        });

        await prisma.property.update({
            where: { id: prop.id },
            data: { locationId: location.id }
        });
        console.log(`Property ${prop.name} linked to location ${location.id}`);
    }

    console.log('--- Location Migration Finished ---');
}

migrate().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
