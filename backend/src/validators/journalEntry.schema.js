const { z } = require('zod');

const journalEntrySchema = z.object({
    entryDate: z.string().date(),
    narration: z.string().max(500).optional(),

    lines: z.array(z.object({
        accountId: z.number().int().positive(),
        type: z.enum(['DEBIT', 'CREDIT']),
        amount: z.number().positive()
    }).strict()).min(2, 'A journal entry needs at least two lines')
}).strict();

const getJournalEntriesSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
});

const journalEntryIdSchema = z.object({
    id: z.string().regex(/^\d+$/, 'id must be a number'),
});

module.exports = {
    journalEntrySchema, getJournalEntriesSchema,
    journalEntryIdSchema
};