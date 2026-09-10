require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { dbConnect, db } = require('../src/config/db');

async function run() {
    try {
        await dbConnect;

        const fileName = process.argv[2];
        const filePath = path.join(__dirname, fileName);
        const query = fs.readFileSync(filePath, 'utf8');

        await db.request().query(query);

        console.log(`${fileName} executed successfully.`);
    } catch (error) {
        console.error('Database script failed:', error);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
}

run();