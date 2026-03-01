import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { LeadNoteCategory } from '@prisma/client';

export class CreateLeadNoteDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsEnum(LeadNoteCategory)
    @IsNotEmpty()
    category: LeadNoteCategory;
}
