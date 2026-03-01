import { chromium, Browser, Page } from 'playwright';
import { IReraScraper, ScrapeOptions } from '../interfaces/rera-scraper.interface';
import { ReraProject } from '../types/rera-project';

export class RajasthanScraper implements IReraScraper {
    private readonly baseUrl = 'https://rera.rajasthan.gov.in';

    getState(): string {
        return 'Rajasthan';
    }

    private log(message: string, level: 'log' | 'warn' | 'error' = 'log') {
        console[level](`[RajasthanScraper] ${message}`);
    }

    async scrape(options?: ScrapeOptions): Promise<Partial<ReraProject>[]> {
        this.log(`Starting Rajasthan RERA scrape${options?.district ? ` for district: ${options.district}` : ''}...`);
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();
            page.setDefaultTimeout(60000);

            await page.goto(`${this.baseUrl}/ProjectSearch?status=3`, { waitUntil: 'networkidle' });

            if (options?.district) {
                this.log(`Filtering by district: ${options.district}`);
                await page.selectOption('#DistrictId', { label: options.district });
                await page.click('#btn_SearchProjectSubmit');
                await page.waitForTimeout(2000);
                await page.waitForLoadState('networkidle');
            }

            try {
                const pageSizeBtn = await page.$('.odropbtn.ds4u-btn');
                if (pageSizeBtn) {
                    await pageSizeBtn.click();
                    try {
                        await page.waitForSelector('.odropdown-content div', { timeout: 5000 });
                        const optionsList = await page.$$('.odropdown-content div');
                        for (const opt of optionsList) {
                            const text = await opt.innerText();
                            if (text.includes('50')) {
                                await opt.click();
                                break;
                            }
                        }
                    } catch (e) {
                        this.log('Page size dropdown content did not appear quickly, skipping.', 'warn');
                    }
                    await page.waitForTimeout(2000);
                    await page.waitForLoadState('networkidle');
                }
            } catch (err: any) {
                this.log(`Could not set page size to 50: ${err.message}`, 'warn');
            }

            const projects: Partial<ReraProject>[] = [];
            let currentPage = 1;

            while (true) {
                await page.waitForSelector('.ds4u-row');
                const projectRows = await page.$$('.ds4u-content.ds4u-tablc .ds4u-row');
                this.log(`Found ${projectRows.length} projects on page ${currentPage}.`);

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

                        const projectIdMatch = detailHref?.match(/id=([^&]+)/);
                        const projectId = projectIdMatch ? projectIdMatch[1] : null;
                        if (!projectId) continue;

                        const detailData = await this.scrapeProjectDetails(browser, projectId);

                        if (detailData) {
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
                            this.log(`Scraped project [${projects.length}]: ${reraNumber}`);
                        }
                    } catch (err: any) {
                        this.log(`Error scraping project row: ${err.message}`, 'error');
                    }
                }

                try {
                    const nextBtn = await page.$('.ds4u-pager-btn.ds4u-selected + a.ds4u-pager-btn');
                    if (nextBtn) {
                        currentPage++;
                        this.log(`Navigating to page ${currentPage}...`);
                        await nextBtn.click();
                        await page.waitForTimeout(2000);
                        await page.waitForLoadState('networkidle');
                    } else {
                        break;
                    }
                } catch (err: any) {
                    this.log(`Pagination failed or reached end: ${err.message}`, 'warn');
                    break;
                }
            }

            return projects;
        } catch (error: any) {
            this.log(`Rajasthan Scraping failed: ${error.message}`, 'error');
            throw error;
        } finally {
            await browser.close();
        }
    }

    async getTotalCount(options?: ScrapeOptions): Promise<number> {
        this.log(`Fetching total count for Rajasthan${options?.district ? ` (District: ${options.district})` : ''}...`);
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();
            return await this.getCountInternal(page, options);
        } catch (error: any) {
            this.log(`Failed to get total count: ${error.message}`, 'error');
            return 0;
        } finally {
            await browser.close();
        }
    }

    async getDistrictCounts(): Promise<{ district: string; count: number }[]> {
        const browser: Browser = await chromium.launch({ headless: true });
        try {
            const page: Page = await browser.newPage();
            await page.goto(`${this.baseUrl}/ProjectSearch?status=3`, { waitUntil: 'networkidle' });

            const districts: any = await page.evaluate(`(() => {
                const sel = document.querySelector('#DistrictId');
                if (!sel) return [];
                const opts = Array.from(sel.options);
                return opts
                    .filter(o => o.value && o.value !== '0' && !o.text.includes('--'))
                    .map(o => ({ value: o.value, text: o.text.trim() }));
            })()`);

            const results: { district: string; count: number }[] = [];
            for (const district of districts) {
                try {
                    const count = await this.getCountInternal(page, { district: district.text });
                    results.push({ district: district.text, count });
                    await page.waitForTimeout(500);
                } catch (err: any) {
                    this.log(`Failed to get count for district ${district.text}: ${err.message}`, 'error');
                }
            }

            return results;
        } finally {
            await browser.close();
        }
    }

    private async getCountInternal(page: Page, options?: ScrapeOptions): Promise<number> {
        await page.goto(`${this.baseUrl}/ProjectSearch?status=3`, { waitUntil: 'networkidle' });

        if (options?.district) {
            const districtValue = await page.evaluate(`((d) => {
                const sel = document.querySelector('#DistrictId');
                if (!sel) return null;
                const opts = Array.from(sel.options);
                const target = opts.find(o => o.text.trim().toLowerCase() === d.toLowerCase());
                return target ? target.value : null;
            })(${JSON.stringify(options.district)})`);

            if (districtValue) {
                await page.selectOption('#DistrictId', districtValue);
                await page.click('#btn_SearchProjectSubmit');
                await page.waitForTimeout(1000);
            }
        }

        const totalCount: any = await page.evaluate(`(() => {
            const footer = document.querySelector('.ds4u-pagination-info');
            const match = footer?.textContent?.match(/of\\s+(\\d+)\\s+items/i);
            return match ? parseInt(match[1], 10) : 0;
        })()`);

        return totalCount || 0;
    }

    private async scrapeProjectDetails(browser: Browser, projectId: string): Promise<Partial<ReraProject>> {
        const page = await browser.newPage();
        try {
            await page.goto(`${this.baseUrl}/Home/ProjectDtls?id=${projectId}`, { waitUntil: 'networkidle' });
            const pageData: any = await page.evaluate(`(() => {
                const results = { status: null, address: null, registrationDateStr: null };
                const labels = Array.from(document.querySelectorAll('span, label, b, td, th'));
                
                const getVal = (txt) => {
                    const target = labels.find(el => el.textContent?.trim().includes(txt));
                    return target?.nextElementSibling?.textContent?.trim() ||
                        target?.parentElement?.nextElementSibling?.textContent?.trim() || null;
                };

                results.status = getVal('Status of Project');
                results.address = getVal('Project Address');
                
                const bodyText = document.body.innerText;
                const regDateMatch = bodyText.match(/Date of Registration\\s*(\\d{2}-\\d{2}-\\d{4})/i);
                if (regDateMatch) results.registrationDateStr = regDateMatch[1];
                
                return results;
            })()`);

            return {
                status: pageData.status,
                address: pageData.address,
                registrationDate: pageData.registrationDateStr ? this.parseDate(pageData.registrationDateStr) : undefined,
            };
        } finally {
            await page.close();
        }
    }

    private parseDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const separator = dateStr.includes('/') ? '/' : '-';
        const [day, month, year] = dateStr.split(separator).map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(year, month - 1, day);
    }
}
