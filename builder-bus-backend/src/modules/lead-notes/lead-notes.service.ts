import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadNoteDto } from './lead-notes.dto';

@Injectable()
export class LeadNotesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(leadId: string, authorId: string, dto: CreateLeadNoteDto) {
        const lead = await this.prisma.lead.findUnique({
            where: { id: leadId },
        });

        if (!lead) {
            throw new NotFoundException('Lead not found');
        }

        return this.prisma.leadNote.create({
            data: {
                leadId,
                authorId,
                content: dto.content,
                category: dto.category,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findByLead(leadId: string) {
        return this.prisma.leadNote.findMany({
            where: { leadId },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async remove(id: string, authorId: string) {
        const note = await this.prisma.leadNote.findUnique({
            where: { id },
        });

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        // Only author can delete their notes (or maybe admins, but for now just author)
        if (note.authorId !== authorId) {
            throw new Error('You can only delete your own notes');
        }

        return this.prisma.leadNote.delete({
            where: { id },
        });
    }
}
