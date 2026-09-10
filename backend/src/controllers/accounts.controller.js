const asyncHandler = require('../utils/asyncHandler');
const accountsService = require('../services/accounts.service');

const listAccounts = asyncHandler(async (req, res) => {
    const accounts = await accountsService.getAccounts();

    return res.status(200).json({ accounts });

});

module.exports = { listAccounts };