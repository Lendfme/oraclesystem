const SqliteDB = require('./sqlite.js').SqliteDB;
const file = "oraclePrice.db";
const sqliteDB = new SqliteDB(file);

function initDB() {
	sqliteDB.createTable(`CREATE TABLE IF NOT EXISTS exchangePrice(
		id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        exchange CHAR(32),
        currency CHAR(32),
		price VARCHAR(64),
        endSign BLOB,
		timestamp INTEGER
        );`);

    sqliteDB.createTable(`CREATE TABLE IF NOT EXISTS lendfMePrice(
		id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        asset CHAR(42),
        currency CHAR(32),
		price VARCHAR(64),
		timestamp INTEGER
        );`);
	console.log('initDB finished!');
}

function insertTable(table ,insertData, insertField) {

    table = table.toString();

    if (insertData[0].constructor != Array) {
        console.log('insertData type error!!');
        return;
    }

    if (!Array.isArray(insertField)) {
        console.log('insertField type error!!');
        return;
    }

    if (insertField.length == 0 || insertData[0].length != insertField.length) {
        console.log('parameter length does not match!!');
        return;
    }
    var str = (10 ** insertField.length).toLocaleString().replace(/,/g, '').slice(1).replace(/0/g, '?').split('').toString();
    var insertSql = `INSERT INTO ${table}(${insertField.toString()}) VALUES(${str})`;
    sqliteDB.insertData(insertSql, insertData);
}

function insertExchangePrice(insertData, insertField = []) {
    insertField = insertField.length == 0 ? ['exchange', 'currency', 'price', 'endSign', 'timestamp'] : insertField;
    insertTable('exchangePrice', insertData, insertField);
}

function insertLendfMePrice(insertData, insertField = []) {
    insertField = insertField.length == 0 ? ['asset', 'currency', 'price', 'timestamp'] : insertField;
    insertTable('lendfMePrice', insertData, insertField);
}

function getExchangePrice(currency = '') {
    let query = `SELECT * FROM exchangePrice WHERE endSign = true AND timestamp = (SELECT max(timestamp) FROM exchangePrice) ${currency ? 'AND currency = "' + currency + '"' : ''}`;
    return new Promise(resolve => {
        sqliteDB.queryData(query, result => {
            resolve(result)
        })
    })
}

function getLendfMePrice(asset = '') {
    let query = `SELECT * FROM lendfMePrice WHERE timestamp = (SELECT max(timestamp) FROM lendfMePrice) ${asset ? 'AND asset = "' + asset + '"' : ''}`;
    return new Promise(resolve => {
        sqliteDB.queryData(query, result => {
            resolve(result)
        })
    })
}

function cleanDatabase(num = 200) {
    var sql = `DELETE FROM exchangePrice WHERE id NOT IN (SELECT id FROM exchangePrice ORDER BY timestamp DESC LIMIT ${num})`;
    sqliteDB.executeSql(sql);
    var sql = `DELETE FROM lendfMePrice WHERE id NOT IN (SELECT id FROM lendfMePrice ORDER BY timestamp DESC LIMIT ${num})`;
	sqliteDB.executeSql(sql);
}

module.exports = {
    initDB,
    insertTable,
    insertExchangePrice,
    insertLendfMePrice,
    getExchangePrice,
    getLendfMePrice,
    cleanDatabase
}
