const { db } = require('../config/db');

async function getAccounts() {
    const result = await db.request().query(
        `SELECT AccountId,AccountCode,AccountName,AccountType FROM AccountMaster WHERE IsActive = 1 ORDER BY AccountName`
    )

    return result.recordset;
}
module.exports = { getAccounts }