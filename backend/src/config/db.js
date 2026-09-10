const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: {
        max: 10,min: 0,idleTimeoutMillis: 30000    
    }
};

const db = new sql.ConnectionPool(config);
const dbConnect = db.connect();

module.exports = {sql,db,dbConnect};