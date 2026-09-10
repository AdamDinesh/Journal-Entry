const asyncHandler = require('../utils/asyncHandler');
const journalEntriesService = require('../services/journalEntries.service');

const createJournalEntry = asyncHandler(async (req, res) => {
    const journalEntry = await journalEntriesService.createJournalEntry(req.body);

    return res.status(201).json({ journalEntry });
});

const listJournalEntries = asyncHandler(async (req, res) => {
    const { page, limit, search, from, to } = req.query;


    const result = await journalEntriesService.getJournalEntries({
        page, limit, search, from, to
    });

    return res.status(200).json(result);
});

const getJournalEntryById = asyncHandler(async (req, res) => {
    const journalEntry = await journalEntriesService.getJournalEntryById(req.params.id);
    if (!journalEntry) {
        return res.status(404).json({ error: { message: 'Journal entry not found' } });
    }
    return res.status(200).json({ journalEntry });
});

module.exports = {
    createJournalEntry,
    listJournalEntries,
    getJournalEntryById
};
