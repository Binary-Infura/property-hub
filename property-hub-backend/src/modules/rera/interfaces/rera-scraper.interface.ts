import { ReraProject } from '@prisma/client';

export interface IReraScraper {
    /**
     * Scrape data from the RERA website and return a list of projects.
     * This is intended to be called by a worker/job.
     */
    scrape(): Promise<Partial<ReraProject>[]>;

    /**
     * The state this scraper handles (e.g., 'Rajasthan', 'Maharashtra').
     */
    getState(): string;
}
