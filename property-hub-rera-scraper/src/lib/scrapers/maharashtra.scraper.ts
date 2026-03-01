import { chromium, Browser, Page } from 'playwright';
import { IReraScraper, ScrapeOptions } from '../interfaces/rera-scraper.interface';
import { ReraProject } from '../types/rera-project';

export class MaharashtraScraper implements IReraScraper {
    private readonly baseUrl = 'https://maharera.maharashtra.gov.in';

    getState(): string {
        return 'Maharashtra';
    }

    private log(message: string, level: 'log' | 'warn' | 'error' = 'log') {
        console[level](`[MaharashtraScraper] ${message}`);
    }

    async scrape(options?: ScrapeOptions): Promise<Partial<ReraProject>[]> {
        this.log('Starting Maharashtra RERA scrape...');
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();
            page.setDefaultTimeout(60000);

            // Navigate to Advanced search page
            await page.goto(`${this.baseUrl}/projects-search-result`, { waitUntil: 'networkidle' });

            // Apply district filter if provided
            if (options?.district) {
                this.log(`Filtering by district: ${options.district}`);
                const divisions = await page.$$eval('#edit-project-division option', (options) =>
                    options.map(o => ({ value: (o as HTMLOptionElement).value, text: (o as HTMLOptionElement).text })).filter(o => o.value !== '')
                );

                let districtFound = false;
                for (const division of divisions) {
                    await page.selectOption('#edit-project-division', division.value);
                    await page.waitForTimeout(1000);

                    const districts = await page.$$eval('#edit-project-district option', (options) =>
                        options.map(o => (o as HTMLOptionElement).text.trim())
                    );

                    if (districts.some(d => d.toLowerCase() === options.district?.toLowerCase())) {
                        await page.selectOption('#edit-project-district', { label: options.district });
                        districtFound = true;
                        this.log(`Found district ${options.district} in division ${division.text}`);
                        break;
                    }
                }

                if (districtFound) {
                    await page.click('#edit-submit--2');
                    await page.waitForLoadState('networkidle');
                } else {
                    this.log(`District ${options.district} not found across all divisions. Falling back to default search.`, 'warn');
                    await page.goto(`${this.baseUrl}/projects-search-result?page=1&op=Search`, { waitUntil: 'networkidle' });
                }
            } else {
                await page.goto(`${this.baseUrl}/projects-search-result?page=1&op=Search`, { waitUntil: 'networkidle' });
            }

            await page.waitForSelector('.click-projectmodal');
            const projectCards = await page.$$('.click-projectmodal');
            this.log(`Found ${projectCards.length} projects on initial page.`);

            const projects: Partial<ReraProject>[] = [];

            for (let i = 0; i < Math.min(projectCards.length, 100); i++) {
                try {
                    const card = projectCards[i];
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

                    const lines = cardInfo.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

                    projects.push({
                        state: this.getState(),
                        reraNumber: cardInfo.registrationNumber,
                        projectName: lines[0] || 'Unknown',
                        promoterName: lines[1] || 'Unknown',
                        status: 'Ongoing',
                        district: cardInfo.text.match(/District:\s*([^,\n]*)/)?.[1]?.trim() || null,
                    });

                    this.log(`Scraped Maharashtra project: ${cardInfo.registrationNumber}`);
                } catch (err: any) {
                    this.log(`Error scraping Maharashtra project row ${i}: ${err.message}`, 'error');
                }
            }

            return projects;
        } catch (error: any) {
            this.log(`Maharashtra Scraping failed: ${error.message}`, 'error');
            throw error;
        } finally {
            await browser.close();
        }
    }

    async getTotalCount(): Promise<number> {
        return 0;
    }

    async getDistrictCounts(): Promise<{ district: string; count: number }[]> {
        return [];
    }
}
