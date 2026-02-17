import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

const prisma = new PrismaClient();

async function importPostalCodes() {
    const csvFilePath = path.join(__dirname, '../../meta-data/5c2f62fe-5afa-4119-a499-fec9d604d5bd.csv');

    if (!fs.existsSync(csvFilePath)) {
        console.error(`CSV file not found at ${csvFilePath}`);
        return;
    }

    console.log('🚀 Starting postal code import...');

    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    let batch: any[] = [];
    const BATCH_SIZE = 1000;
    let isHeader = true;

    for await (const line of rl) {
        if (isHeader) {
            isHeader = false;
            continue;
        }

        // Simple CSV parser for this specific format
        // format: circlename,regionname,divisionname,officename,pincode,officetype,delivery,district,statename,latitude,longitude
        const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());

        if (parts.length < 5) continue;

        const [
            circleName,
            regionName,
            divisionName,
            officeName,
            pincode,
            officeType,
            delivery,
            district,
            stateName,
            latitude,
            longitude
        ] = parts;

        batch.push({
            code: pincode,
            circleName,
            regionName,
            divisionName,
            officeName,
            officeType,
            delivery,
            district,
            stateName,
            latitude: latitude === 'NA' ? null : latitude,
            longitude: longitude === 'NA' ? null : longitude,
            country: 'India',
            city: district, // Using district as city if specific city is not available
            state: stateName
        });

        if (batch.length >= BATCH_SIZE) {
            await prisma.postalCode.createMany({
                data: batch,
                skipDuplicates: true
            });
            count += batch.length;
            console.log(`✅ Imported ${count} records...`);
            batch = [];
        }
    }

    if (batch.length > 0) {
        await prisma.postalCode.createMany({
            data: batch,
            skipDuplicates: true
        });
        count += batch.length;
    }

    console.log(`✨ Successfully imported ${count} postal codes.`);
}

importPostalCodes()
    .catch(e => {
        console.error('❌ Error importing postal codes:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
