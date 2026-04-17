import { ReraProject } from '../types/rera-project';

export interface ScrapeOptions {
    district?: string;
    limit?: number;
}

export interface IReraScraper {
    getState(): string;
    scrape(options?: ScrapeOptions): Promise<Partial<ReraProject>[]>;
    getTotalCount?(options?: ScrapeOptions): Promise<number>;
    getDistrictCounts?(): Promise<{ district: string; count: number }[]>;
}
