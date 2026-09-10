CREATE TABLE AccountMaster(
    AccountId INT IDENTITY(1,1) PRIMARY KEY,
    AccountCode VARCHAR(20) NOT NULL UNIQUE,
    AccountName VARCHAR(150) NOT NULL,
    AccountType VARCHAR(30) NOT NULL ,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_AccountMaster_Type CHECK(AccountType IN ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'))
    
);

CREATE TABLE JournalEntryHeader(
    JournalEntryId INT IDENTITY(1,1) PRIMARY KEY,
    EntryDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Narration VARCHAR(500) NULL,
    TotalDebit DECIMAL(18,2) NOT NULL,
    TotalCredit DECIMAL(18,2) NOT NULL,
     CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
     CONSTRAINT CK_JournalEntryHeader_Balanced CHECK (TotalDebit = TotalCredit)
);

CREATE TABLE JournalEntryLines(
    LineId INT IDENTITY(1,1) PRIMARY KEY,
    JournalEntryId INT NOT NULL,
    AccountId INT NOT NULL,
    LineType VARCHAR(6) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    LineNumber INT NOT NULL,

    CONSTRAINT FK_JournalEntryLines_Header FOREIGN KEY(JournalEntryId) REFERENCES JournalEntryHeader(JournalEntryId),
    CONSTRAINT FK_JournalEntryLines_Account FOREIGN KEY(AccountId) REFERENCES AccountMaster(AccountId),
    CONSTRAINT CK_JournalEntryLines_Type CHECK (LineType IN ('DEBIT', 'CREDIT')),
    CONSTRAINT CK_JournalEntryLines_Amount CHECK (Amount > 0)
);

CREATE TABLE AuditLogs(
    AuditId INT IDENTITY(1,1) PRIMARY KEY,
    JournalEntryId INT NOT NULL,
    Action VARCHAR(50) NOT NULL,
    Details VARCHAR(500) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_AuditLogs_Header FOREIGN KEY(JournalEntryId) REFERENCES JournalEntryHeader(JournalEntryId)
);

CREATE INDEX IX_JournalEntryHeader_EntryDate ON JournalEntryHeader(EntryDate);
CREATE INDEX IX_JournalEntryLines_JournalEntryId ON JournalEntryLines(JournalEntryId);
CREATE INDEX IX_JournalEntryLines_AccountId ON JournalEntryLines(AccountId);