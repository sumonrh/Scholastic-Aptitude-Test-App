const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'satbook.db');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Cannot open database', err.message);
  }
});

function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS logininfo (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS vocabultable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS progresstable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      date TEXT NOT NULL,
      score REAL NOT NULL,
      FOREIGN KEY(username) REFERENCES logininfo(username)
    )`);

    const countSql = 'SELECT COUNT(*) AS cnt FROM vocabultable';
    db.get(countSql, [], (err, row) => {
      if (!err && row && row.cnt === 0) {
        const entries = [
          ['What is a synonym of cunning?', 'craftiness'],
          ['What is an antonym of ephemeral?', 'lasting'],
          ['What does “obstinate” mean?', 'stubborn'],
          ['Choose the best meaning for aesthetic.', 'artistic'],
          ['What does “lucid” mean?', 'clear']
        ];
        const insert = db.prepare('INSERT INTO vocabultable (question, answer) VALUES (?, ?)');
        for (const [q, a] of entries) insert.run(q, a);
        insert.finalize();
      }
    });
  });
}

module.exports = { db, init };
