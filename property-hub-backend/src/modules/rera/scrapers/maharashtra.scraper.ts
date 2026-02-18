import { Injectable, Logger } from '@nestjs/common';
import { ReraProject } from '@prisma/client';
import { chromium, Browser, Page } from 'playwright';
import { IReraScraper } from '../interfaces/rera-scraper.interface';

@Injectable()
export class MaharashtraScraper implements IReraScraper {
    private readonly logger = new Logger(MaharashtraScraper.name);
    private readonly baseUrl = 'https://maharera.maharashtra.gov.in';

    getState(): string {
        return 'Maharashtra';
    }

    async scrape(): Promise<Partial<ReraProject>[]> {
        this.logger.log('Starting Maharashtra RERA scrape...');
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();

            // Navigate to search results page directly to skip initial form interaction
            // page=1 and op=Search lists projects
            await page.goto(`${this.baseUrl}/projects-search-result?page=1&op=Search`, { waitUntil: 'networkidle' });

            // Wait for results
            await page.waitForSelector('.click-projectmodal');

            const projectCards = await page.$$('.click-projectmodal');
            this.logger.log(`Found ${projectCards.length} projects on initial page.`);

            const projects: Partial<ReraProject>[] = [];

            // Limit to first 10 for demonstration
            for (let i = 0; i < Math.min(projectCards.length, 10); i++) {
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
