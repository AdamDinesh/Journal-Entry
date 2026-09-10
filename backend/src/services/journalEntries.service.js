const { db, sql } = require('../config/db');

async function createJournalEntry(data) {
    const { entryDate, narration, lines } = data;

    // 1. debit and credit should be equal,
    const totalDebit = lines
        .filter(line => line.type === 'DEBIT')
        .reduce((sum, line) => sum + line.amount, 0);

    const totalCredit = lines
        .filter(line => line.type === 'CREDIT')
        .reduce((sum, line) => sum + line.amount, 0);

    if (totalDebit !== totalCredit) {
        const error = new Error('Total debit and credit must be equal.');
        error.statusCode = 422;
        throw error;
    }

    const accountIds = [...new Set(lines.map((line) => line.accountId))];

    const transaction = new sql.Transaction(db);

    //2. validate accounts should be exists and active.

    try {
        await transaction.begin();
        const accountRequest = new sql.Request(transaction);

        const placeholders = accountIds.map((accountId, index) => {
            const parameter = `account${index}`;

            accountRequest.input(parameter, sql.Int, accountId);

            return `@${parameter}`;
        });

        const accountResult = await accountRequest.query(`
            SELECT AccountId, IsActive FROM AccountMaster WHERE AccountId IN (${placeholders.join(', ')})
            `);
        if (accountResult.recordset.length !== accountIds.length) {
            const error = new Error('One or more accounts do not exist.');
            error.statusCode = 422;
            throw error;
        }

        const inactiveAccount = accountResult.recordset.find(
            account => !account.IsActive
        );

        if (inactiveAccount) {
            const error = new Error('One or more accounts are inactive.');
            error.statusCode = 422;
            throw error;
        }

        // 3. create Journal entry header
        const headerRequest = new sql.Request(transaction);

        headerRequest.input('entryDate', sql.Date, entryDate);
        headerRequest.input('narration', sql.VarChar(500), narration || null);
        headerRequest.input('totalDebit', sql.Decimal(18, 2), totalDebit);
        headerRequest.input('totalCredit', sql.Decimal(18, 2), totalCredit);

        const headerResult = await headerRequest.query(`
    INSERT INTO JournalEntryHeader (EntryDate,Narration,TotalDebit,TotalCredit) OUTPUT INSERTED.JournalEntryId VALUES(@entryDate, @narration, @totalDebit, @totalCredit)
    `);
        const journalEntryId = headerResult.recordset[0].JournalEntryId;

        // 4. create each journal entry lines.
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineRequest = new sql.Request(transaction);
            lineRequest.input('journalEntryId', sql.Int, journalEntryId);
            lineRequest.input('accountId', sql.Int, line.accountId);
            lineRequest.input('lineType', sql.VarChar(6), line.type);
            lineRequest.input('amount', sql.Decimal(18, 2), line.amount);
            lineRequest.input('lineNumber', sql.Int, i + 1);

            await lineRequest.query(`
    INSERT INTO JournalEntryLines (JournalEntryId, AccountId, LineType, Amount, LineNumber)
    VALUES (@journalEntryId, @accountId, @lineType, @amount, @lineNumber)
  `);
        }

        // 5. create audit log.

        const auditRequest = new sql.Request(transaction);
        auditRequest.input('journalEntryId', sql.Int, journalEntryId);
        auditRequest.input('action', sql.VarChar(50), 'CREATED');
        auditRequest.input('details', sql.VarChar(500), `Journal entry created`);

        await auditRequest.query(`
      INSERT INTO AuditLogs (JournalEntryId, Action, Details)
      VALUES (@journalEntryId, @action, @details)
    `);

        // 6. commit and send response.
        await transaction.commit();
        return { id: journalEntryId, entryDate, totalDebit, totalCredit }

    } catch (error) {
        await transaction.rollback();
        throw error;
    }

}

async function getJournalEntries({ page, limit, search, from, to }) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const request = db.request();

    if (search) {
        conditions.push('Narration LIKE @search');
        request.input('search', sql.VarChar(500), `%${search}%`);
    }

    if (from) {
        conditions.push('EntryDate >= @from');
        request.input('from', sql.Date, from);
    }

    if (to) {
        conditions.push('EntryDate <= @to');
        request.input('to', sql.Date, to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limitNum);

    const dataQuery = `SELECT JournalEntryId, EntryDate, Narration, TotalDebit, TotalCredit, CreatedAt FROM JournalEntryHeader ${whereClause} ORDER BY CreatedAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;


    const countRequest = db.request();

    if (search) {
        countRequest.input('search', sql.VarChar(500), `%${search}%`);
    }
    if (from) {
        countRequest.input('from', sql.Date, from);
    }
    if (to) {
        countRequest.input('to', sql.Date, to);
    }


    const countQuery = `SELECT COUNT(*) AS Total FROM JournalEntryHeader ${whereClause}`;

    const [result, countResult] = await Promise.all([
        request.query(dataQuery),
        countRequest.query(countQuery),
    ]);
    const total = countResult.recordset[0].Total;
    return {
        journalEntries: result.recordset,
        pagination: {
            total, page, limit, totalPages: Math.ceil(total / limitNum)
        }
    };
}


async function getJournalEntryById(id) {
    const headerRequest = db.request();
    headerRequest.input('id', sql.Int, id);

    const headerResult = await headerRequest.query(`
        SELECT JournalEntryId, EntryDate, Narration, TotalDebit, TotalCredit, CreatedAt
        FROM JournalEntryHeader WHERE JournalEntryId = @id
        `);

    if (headerResult.recordset.length === 0) {
        return null;
    }

    const header = headerResult.recordset[0];

    const linesRequest = db.request();
    linesRequest.input('id', sql.Int, id);

    const linesResult = await linesRequest.query(`
        SELECT l.LineId, l.AccountId, a.AccountName, l.LineType, l.Amount
        FROM JournalEntryLines l
        JOIN AccountMaster a ON a.AccountId = l.AccountId
        WHERE l.JournalEntryId = @id ORDER BY l.LineId
    `);

    const auditRequest = db.request();
    auditRequest.input('id', sql.Int, id);

    const auditResult = await auditRequest.query(`
        SELECT AuditId, Action, Details, CreatedAt FROM AuditLogs
        WHERE JournalEntryId = @id ORDER BY CreatedAt ASC
    `);

    return {
        ...header,
        lines: linesResult.recordset,
        auditLogs: auditResult.recordset,
    };
}

module.exports = { createJournalEntry, getJournalEntries, getJournalEntryById };
