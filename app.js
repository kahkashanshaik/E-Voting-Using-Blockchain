const express = require('express');
const mysql = require('mysql');
const expressValidator = require('express-validator');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const flash = require('flash');



dotenv.config({ path: './.env' });
/*start server*/
const app  = express();
/*creating conection to db*/
const db = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE
});
db.connect( (error) => {
	if(error)
		console.log(error);
	else
		console.log("database status: connected");
});


const publicDirectory = path.join(__dirname, './public');

app.use(express.static(publicDirectory));
// Parse url encoded bodies ( as send by html form)
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(expressValidator());
app.use(session({secret: 'krunal', saveUninitialized: false, resave: false}));
app.set('view engine', 'hbs');
app.use(flash());

//Define Rotues
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
// Defining Static route
app.get('/build/contracts/Election', (req, res) => {
       fs.readFile( __dirname +'/build/contracts/Election' +".json", 'utf8', function (err, data) {
           res.send(data);
       });
});

//app is going to listen on this port number
app.listen(5000, () => {
	console.log("Server started on site http://localhost:5000");
});