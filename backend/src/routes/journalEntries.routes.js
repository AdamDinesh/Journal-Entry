const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate')
const { createJournalEntry, listJournalEntries, getJournalEntryById } = require('../controllers/journalEntries.controller');
const { journalEntrySchema, getJournalEntriesSchema, journalEntryIdSchema } = require('../validators/journalEntry.schema');

router.get('/:id', validate(journalEntryIdSchema, 'params'), getJournalEntryById);
router.get('/', validate(getJournalEntriesSchema, 'query'), listJournalEntries);
router.post('/', validate(journalEntrySchema), createJournalEntry);


module.exports = router;

