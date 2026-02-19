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

                        const projectIdMatch = detailHref.match(/id=([^&]+)/);
                        const projectId = projectIdMatch ? projectIdMatch[1] : null;
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
                // Find option by text content case-insensitively
                const districtValue = await page.evaluate((district) => {
                    const select = document.querySelector('#DistrictId') as HTMLSelectElement;
                    if (!select) return null;
                    const options = Array.from(select.options);
                    const target = options.find(o => o.text.trim().toLowerCase() === district.toLowerCase());
                    return target ? target.value : null;
                }, options.district);

                if (districtValue) {
                    await page.selectOption('#DistrictId', districtValue);
                    await page.click('#btn_SearchProjectSubmit');

                    // Wait for grid to load and update
                    try {
                        await page.waitForSelector('.ds4u-grid', { timeout: 15000 });
                        await page.waitForTimeout(2000); // Wait for pagination to settle
                    } catch (e) {
                        this.logger.warn(`Grid didn't load in search, continuing anyway: ${e.message}`);
                    }
                } else {
                    this.logger.warn(`District "${options.district}" not found in dropdown`);
                }
            } else {
                // If no district, just wait for initial grid
                await page.waitForSelector('.ds4u-grid', { timeout: 15000 });
            }

            // Robust count extraction: Try specific selector first, then whole body
            const totalCount = await page.evaluate(() => {
                const footer = document.querySelector('.ds4u-pagination-info');
                const text = footer ? footer.textContent : document.body.innerText;
                const match = text?.match(/of\s+(\d+)\s+items/i);
                return match ? parseInt(match[1], 10) : 0;
            });

            if (totalCount > 0) {
                this.logger.log(`Total projects found: ${totalCount}`);
                return totalCount;
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
            // Use ProjectDtls as it has the modern UI with address clearly visible
            await page.goto(`${this.baseUrl}/Home/ProjectDtls?id=${projectId}`, { waitUntil: 'networkidle' });

            const detail: Partial<ReraProject> = {};

            // More robust extraction for the modern UI
            const pageData = await page.evaluate(() => {
                const findValueByLabel = (label: string) => {
                    const elements = Array.from(document.querySelectorAll('span, label, b, td, th'));
                    const target = elements.find(el => el.textContent?.trim().includes(label));
                    if (!target) return null;

                    // The address and some other fields are in the next sibling element
                    return target.nextElementSibling?.textContent?.trim() ||
                        target.parentElement?.nextElementSibling?.textContent?.trim() ||
                        null;
                };

                const bodyText = document.body.innerText;

                // Extract Dates using Regex from whole body text
                const regDateMatch = bodyText.match(/Date of Registration\s*(\d{2}-\d{2}-\d{4})/i);
                // The site uses DD-MM-YYYY format now

                return {
                    status: findValueByLabel('Status of Project'),
                    address: findValueByLabel('Project Address'),
                    registrationDateStr: regDateMatch ? regDateMatch[1] : null,
                };
            });

            detail.status = pageData.status;
            detail.address = pageData.address;

            if (pageData.registrationDateStr) {
                // Update parseDate to handle both / and -
                detail.registrationDate = this.parseDate(pageData.registrationDateStr);
            }

            // Optional: Fetch completion date from "Quick Facts" tab if needed
            // For now, focus on the Address which was the primary request

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
        // Handle both DD/MM/YYYY and DD-MM-YYYY
        const separator = dateStr.includes('/') ? '/' : '-';
        const [day, month, year] = dateStr.split(separator).map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(year, month - 1, day);
    }
}
