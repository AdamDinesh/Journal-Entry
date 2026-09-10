DELETE FROM AuditLogs;
DELETE FROM JournalEntryLines;
DELETE FROM JournalEntryHeader;
DELETE FROM AccountMaster;

DBCC CHECKIDENT ('AuditLogs', RESEED, 0);
DBCC CHECKIDENT ('JournalEntryLines', RESEED, 0);
DBCC CHECKIDENT ('JournalEntryHeader', RESEED, 0);
DBCC CHECKIDENT ('AccountMaster', RESEED, 0);