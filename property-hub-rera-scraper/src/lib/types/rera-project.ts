export interface ReraProject {
    id?: string;
    state: string;
    district?: string | null;
    reraNumber: string;
    projectName: string;
    promoterName: string;
    status?: string | null;
    address?: string | null;
    registrationDate?: Date | null;
    completionDate?: Date | null;
    updatedAt?: Date;
    createdAt?: Date;
}
