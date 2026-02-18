import { Injectable, Logger } from '@nestjs/common';
import { ReraProject } from '@prisma/client';
import { chromium, Browser, Page } from 'playwright';
import { IReraScraper, ScrapeOptions } from '../interfaces/rera-scraper.interface';

@Injectable()
export class RajasthanScraper implements IReraScraper {
    private readonly logger = new Logger(RajasthanScraper.name);
    private readonly baseUrl = 'https://rera.rajasthan.gov.in';

    getState(): string {
        return 'Rajasthan';
    }

    async scrape(options?: ScrapeOptions): Promise<Partial<ReraProject>[]> {
        this.logger.log(`Starting Rajasthan RERA scrape${options?.district ? ` for district: ${options.district}` : ''}...`);
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();
            page.setDefaultTimeout(60000);

            // Navigate to Advanced search page
            await page.goto(`${this.baseUrl}/ProjectSearch?status=3`, { waitUntil: 'networkidle' });

            // Apply district filter if provided
            if (options?.district) {
                this.logger.log(`Filtering by district: ${options.district}`);
                await page.selectOption('#DistrictId', { label: options.district });
                await page.click('#btn_SearchProjectSubmit');
                // Wait for the total count to likely update and table to refresh
                await page.waitForTimeout(2000);
                await page.waitForLoadState('networkidle');
                this.logger.log(`Filter applied for district: ${options.district}`);
            }

            // Set page size to 50 to get more records efficiently
            try {
                const pageSizeBtn = await page.$('.odropbtn.ds4u-btn');
                if (pageSizeBtn) {
                    await pageSizeBtn.click();
                    await page.waitForSelector('.odropdown-content div');
                    const optionsList = await page.$$('.odropdown-content div');
                    for (const opt of optionsList) {
                        const text = await opt.innerText();
                        if (text.includes('50')) {
                            await opt.click();
                            break;
                        }
                    }
                    await page.waitForTimeout(2000);
                    await page.waitForLoadState('networkidle');
                }
            } catch (err) {
                this.logger.warn(`Could not set page size to 50: ${err.message}`);
            }

            const projects: Partial<ReraProject>[] = [];
            let currentPage = 1;

            while (true) {
                // Wait for the grid rows to be present
                await page.waitForSelector('.ds4u-row');
                const projectRows = await page.$$('.ds4u-content.ds4u-tablc .ds4u-row');
                this.logger.log(`Found ${projectRows.length} projects on page ${currentPage}.`);

                for (const row of projectRows) {
                    try {
                        const cells = await row.$$('td');
                        if (cells.length < 6) continue;

                        const district = (await cells[0].innerText()).trim();
                        const projectName = (await cells[1].innerText()).trim();
                        const promoterName = (await cells[3].innerText()).trim();
                        const reraNumber = (await cells[5].innerText()).trim();

                        const viewButton = await cells[cells.length - 1].$('a');
                        const detailHref = await viewButton?.getAttribute('href');

                        if (!detailHref) continue;
                        const projectId = detailHref.split('=')[1];
                        if (!projectId) continue;

                        const detailData = await this.scrapeProjectDetails(browser, projectId);

                        projects.push({
                            state: this.getState(),
                            reraNumber,
                            projectName,
                            promoterName,
                            district,
                            status: detailData.status,
                            address: detailData.address,
                            registrationDate: detailData.registrationDate,
                            completionDate: detailData.completionDate,
                        });

                        this.logger.log(`Scraped project [${projects.length}]: ${reraNumber}`);
                    } catch (err) {
                        this.logger.error(`Error scraping project row: ${err.message}`);
                    }
                }

                // Try to go to next page
                try {
                    const nextBtn = await page.$('.ds4u-pager-btn.ds4u-selected + a.ds4u-pager-btn');
                    if (nextBtn) {
                        currentPage++;
                        this.logger.log(`Navigating to page ${currentPage}...`);
                        await nextBtn.click();
                        await page.waitForTimeout(2000);
                        await page.waitForLoadState('networkidle');
                    } else {
                        this.logger.log('No more pages found.');
                        break;
                    }
                } catch (err) {
                    this.logger.warn(`Pagination failed or reached end: ${err.message}`);
                    break;
                }
            }

            this.logger.log(`Returning ${projects.length} projects.`);
            return projects;
        } catch (error) {
            this.logger.error(`Rajasthan Scraping failed: ${error.message}`);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async getTotalCount(options?: ScrapeOptions): Promise<number> {
        this.logger.log(`Fetching total count for Rajasthan${options?.district ? ` (District: ${options.district})` : ''}...`);
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();
            await page.goto(`${this.baseUrl}/ProjectSearch?status=3`, { waitUntil: 'networkidle' });

            if (options?.district) {
                await page.selectOption('#DistrictId', { label: options.district });
                await page.click('#btn_SearchProjectSubmit');
                await page.waitForTimeout(2000);
                await page.waitForLoadState('networkidle');
            }

            // Extract count from footer text like "1 - 10 of 4739 items"
            const countText = await page.evaluate(() => {
                const footer = document.querySelector('.ds4u-pagination-info');
                return footer ? footer.textContent : null;
            });

            if (countText) {
                const match = countText.match(/of\s+(\d+)\s+items/i);
                if (match && match[1]) {
                    const count = parseInt(match[1], 10);
                    this.logger.log(`Total projects found: ${count}`);
                    return count;
                }
            }

            return 0;
        } catch (error) {
            this.logger.error(`Failed to get total count: ${error.message}`);
            return 0;
        } finally {
            await browser.close();
        }
    }

    private async scrapeProjectDetails(browser: Browser, projectId: string): Promise<Partial<ReraProject>> {
        const page = await browser.newPage();
        try {
            // Use the full project view page as it has more structured data
            await page.goto(`${this.baseUrl}/Home/ViewProject?id=${projectId}`, { waitUntil: 'networkidle' });

            const detail: Partial<ReraProject> = {};

            // Helper to find text in tables
            const findValueByLabel = async (label: string) => {
                return await page.evaluate((lbl) => {
                    const cells = Array.from(document.querySelectorAll('td, th, label, span'));
                    for (let i = 0; i < cells.length; i++) {
                        if (cells[i].textContent?.includes(lbl)) {
                            // Try to get next cell or parent's next sibling or similar
                            // This is a simplified heuristic
                            return cells[i].nextElementSibling?.textContent?.trim() ||
                                cells[i].parentElement?.nextElementSibling?.textContent?.trim() ||
                                null;
                        }
                    }
                    return null;
                }, label);
            };

            // Extract Status
            detail.status = await findValueByLabel('Status of Project');

            // Extract Address
            detail.address = await findValueByLabel('Project Address');

            // Extract Dates (Heuristic based on page structure)
            const dateStrings = await page.evaluate(() => {
                const bodyContent = document.body.innerText;
                const regDateMatch = bodyContent.match(/Date of Registration\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);
                const compDateMatch = bodyContent.match(/Estimated Finish Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);

                return {
                    registration: regDateMatch ? regDateMatch[1] : null,
                    completion: compDateMatch ? compDateMatch[1] : null,
                };
            });

            if (dateStrings.registration) {
                detail.registrationDate = this.parseDate(dateStrings.registration);
            }

            if (dateStrings.completion) {
                detail.completionDate = this.parseDate(dateStrings.completion);
            }

            return detail;
        } catch (err) {
            this.logger.warn(`Error fetching details for project ${projectId}: ${err.message}`);
            return {};
        } finally {
            await page.close();
        }
    }

    private parseDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(year, month - 1, day);
    }
}
