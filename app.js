const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

const db = new sqlite3.Database(':memory:');

//create database
db.serialize(() => {
    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      name TEXT,
      password TEXT
    )`);

    db.run(`INSERT INTO users (role, name, password) VALUES
        ('Admin', 'admin', 'admin123'),
        ('User', 'user', 'user123')
    `);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views')); //putting the file path into /views
app.set('view engine', 'ejs');//this is setting the engine to use ejs instead

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { role, name, password } = req.body;

    const query = `SELECT * FROM users WHERE role='${role}' AND name='${name}' AND password='${password}'`;

    db.all(query, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        if (rows.length > 0) {
            if (role === 'Admin') {
                db.all(`SELECT * FROM users`, (err, users) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    res.render('admin-dashboard', { users: users });
                });
            } else {
                res.send('Login successful');
            }
        } else {
            res.send('Invalid credentials');
        }
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
