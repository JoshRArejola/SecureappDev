const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const helmet = require('helmet');//helmet from https://www.npmjs.com/package/react-helmet for security
const morgan = require('morgan'); //morgan from https://www.npmjs.com/package/morgan for logging for https apps

const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet()); //using helmet to secure the headers of the application
app.use(morgan('combined')); //morgan for logging everything
app.set('views', path.join(__dirname, 'views')); //putting the file path into /views
app.set('view engine', 'ejs');//this is setting the engine to use ejs instead

let loggedInUser = null; //setting user login

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

//using parameterized query to secure the sql instead of the noraml way
app.post('/login', (req, res) => {
    const { role, name, password } = req.body;
    loggedInUser = name;

    const query = 'SELECT * FROM users WHERE role=? AND name=? AND password=?';
    db.all(query, [role, name, password], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        } 
        if (rows.length > 0) {
            if (role === 'Admin') {
                res.redirect('/admin-dashboard');
            } else {
                res.send('Login successful');
            }
        } else {
            res.send('Invalid credentials');
        }
    });
});

//taking from admin dashboard
app.get('/admin-dashboard', (req, res) => {
    db.all(`SELECT * FROM users`, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('admin-dashboard', { users: rows, loggedInUser: loggedInUser });
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
