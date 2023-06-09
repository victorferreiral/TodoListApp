const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');
const app = express();

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed INTEGER)');

  app.use(express.json());

  app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  });

  app.post('/tasks', (req, res) => {
    const { text, completed } = req.body.task;
    db.run('INSERT INTO tasks (text, completed) VALUES (?, ?)', [text, completed], function (err) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        const task = { id: this.lastID, text, completed };
        res.status(201).json(task);
      }
    });
  });

  app.put('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const { text, completed } = req.body.task;
    db.run('UPDATE tasks SET text = ?, completed = ? WHERE id = ?', [text, completed, id], function (err) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error(err);
            res.status(500).send(err);
          } else {
            res.json(row);
          }
        });
      }
    });
  });

  app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        res.json({ message: 'Task deleted successfully' });
      }
    });
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});