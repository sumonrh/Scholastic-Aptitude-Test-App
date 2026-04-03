const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { db, init } = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

init();

app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username/password required' });

  db.run('INSERT INTO logininfo(username,password) VALUES (?, ?)', [username, password], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'User already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    return res.json({ message: 'User created' });
  });
});

app.post('/api/signin', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username/password required' });

  db.get('SELECT * FROM logininfo WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Signed in', username: row.username });
  });
});

app.post('/api/unsubscribe', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username/password required' });

  db.run('DELETE FROM logininfo WHERE username = ? AND password = ?', [username, password], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found or wrong password' });
    res.json({ message: 'Unsubscribed' });
  });
});

app.get('/api/vocab', (req, res) => {
  db.all('SELECT id, question, answer FROM vocabultable', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/progress', (req, res) => {
  const { username, score } = req.body;
  if (!username || score == null) return res.status(400).json({ error: 'username and score are required' });

  const date = new Date().toISOString();
  db.run('INSERT INTO progresstable(username,date,score) VALUES(?,?,?)', [username, date, score], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Progress saved' });
  });
});

app.get('/api/progress/:username', (req, res) => {
  db.all('SELECT date, score FROM progresstable WHERE username = ? ORDER BY date ASC', [req.params.username], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SAT web app backend running at http://localhost:${port}`);
});
