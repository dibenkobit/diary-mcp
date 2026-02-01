import { z } from 'zod';

export const saveMemoSchema = z.object({
    content: z.string().min(1).max(50000).describe('The memo text')
});

export const readMemosSchema = z.object({
    limit: z.number().int().positive().max(100).default(10).describe('Number of recent memos to retrieve')
});
