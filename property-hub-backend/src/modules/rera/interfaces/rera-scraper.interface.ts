import { ReraProject } from '@prisma/client';

export interface ScrapeOptions {
    district?: string;
    limit?: number;
}

export interface IReraScraper {
    /**
     * Scrape data from the RERA website and return a list of projects.
     * This is intended to be called by a worker/job.
     */
    scrape(options?: ScrapeOptions): Promise<Partial<ReraProject>[]>;

    /**
     * The state this scraper handles (e.g., 'Rajasthan', 'Maharashtra').
     */
    getState(): string;

    /**
     * Get the total number of projects available on the portal without scraping them.
     */
    getTotalCount?(options?: ScrapeOptions): Promise<number>;
}
