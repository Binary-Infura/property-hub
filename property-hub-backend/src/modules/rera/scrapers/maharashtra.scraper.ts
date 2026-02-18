import { Injectable, Logger } from '@nestjs/common';
import { ReraProject } from '@prisma/client';
import { chromium, Browser, Page } from 'playwright';
import { IReraScraper, ScrapeOptions } from '../interfaces/rera-scraper.interface';

@Injectable()
export class MaharashtraScraper implements IReraScraper {
    private readonly logger = new Logger(MaharashtraScraper.name);
    private readonly baseUrl = 'https://maharera.maharashtra.gov.in';

    getState(): string {
        return 'Maharashtra';
    }

    async scrape(options?: ScrapeOptions): Promise<Partial<ReraProject>[]> {
        this.logger.log('Starting Maharashtra RERA scrape...');
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();

            // Set a longer timeout for Maharashtra RERA as it can be slow
            page.setDefaultTimeout(60000);

            // Navigate to Advanced search page
            await page.goto(`${this.baseUrl}/projects-search-result`, { waitUntil: 'networkidle' });

            // Apply district filter if provided
            if (options?.district) {
                this.logger.log(`Filtering by district: ${options.district}`);

                // On MahaRERA, you must select a Division first for District to populate.
                // Since we don't know the division, we'll try to find which division contains this district.
                const divisions = await page.$$eval('#edit-project-division option', (options) =>
                    options.map(o => ({ value: (o as HTMLOptionElement).value, text: (o as HTMLOptionElement).text })).filter(o => o.value !== '')
                );

                let districtFound = false;
                for (const division of divisions) {
                    await page.selectOption('#edit-project-division', division.value);
                    await page.waitForTimeout(1000); // Wait for results to populate

                    const districts = await page.$$eval('#edit-project-district option', (options) =>
                        options.map(o => (o as HTMLOptionElement).text.trim())
                    );

                    if (districts.some(d => d.toLowerCase() === options.district?.toLowerCase())) {
                        await page.selectOption('#edit-project-district', { label: options.district });
                        districtFound = true;
                        this.logger.log(`Found district ${options.district} in division ${division.text}`);
                        break;
                    }
                }

                if (districtFound) {
                    await page.click('#edit-submit--2');
                    await page.waitForLoadState('networkidle');
                } else {
                    this.logger.warn(`District ${options.district} not found across all divisions. Falling back to default search.`);
                    await page.goto(`${this.baseUrl}/projects-search-result?page=1&op=Search`, { waitUntil: 'networkidle' });
                }
            } else {
                await page.goto(`${this.baseUrl}/projects-search-result?page=1&op=Search`, { waitUntil: 'networkidle' });
            }

            // Wait for results
            await page.waitForSelector('.click-projectmodal');

            const projectCards = await page.$$('.click-projectmodal');
            this.logger.log(`Found ${projectCards.length} projects on initial page.`);

            const projects: Partial<ReraProject>[] = [];

            // Limit to first 100 for demonstration
            for (let i = 0; i < Math.min(projectCards.length, 100); i++) {
                try {
                    const card = projectCards[i];

                    // In Maharashtra RERA, the cards contain basic info
                    const cardInfo = await card.evaluate((el) => {
                        const htmlEl = el as HTMLElement;
                        const text = htmlEl.innerText;
                        const regExp = /#\s*(P\d+)/;
                        const match = text.match(regExp);
                        return {
                            text,
                            registrationNumber: match ? match[1] : null,
                        };
                    });

                    if (!cardInfo.registrationNumber) continue;

                    // In a real implementation, we would click the modal or go to the detail URL
                    // The detail URL is usually https://maharerait.maharashtra.gov.in/public/project/view/[ID]
                    // But for this example, we'll extract what we can from the list or a mock detail fetch

                    // Heuristic extraction from card text
                    const lines = cardInfo.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

                    projects.push({
                        state: this.getState(),
                        reraNumber: cardInfo.registrationNumber,
                        projectName: lines[0] || 'Unknown',
                        promoterName: lines[1] || 'Unknown',
                        status: 'Ongoing', // Default if not found
                        district: cardInfo.text.match(/District:\s*([^,\n]*)/)?.[1]?.trim() || null,
                    });

                    this.logger.log(`Scraped Maharashtra project: ${cardInfo.registrationNumber}`);
                } catch (err) {
                    this.logger.error(`Error scraping Maharashtra project row ${i}: ${err.message}`);
                }
            }

            return projects;
        } catch (error) {
            this.logger.error(`Maharashtra Scraping failed: ${error.message}`);
            throw error;
        } finally {
            await browser.close();
        }
    }
}
