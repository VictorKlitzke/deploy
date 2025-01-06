const sqllite3 = require('sqlite3').verbose();   
const path = require('path');

const dbPath = path.resolve(__dirname, './financas.db');

const pool = new sqllite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados SQLite:", err.message);
    } else {
        console.log("Conectado ao banco de dados SQLite com sucesso!");
    }
});

module.exports = pool