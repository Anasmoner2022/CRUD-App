require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

// database connection
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Database is connected!!'))
    .catch((error) => console.log('Error connecting to the database:', error));

// middleware (if needed)
app.use(express.urlencoded({extended: false})); //making the form data available as req.body
app.use(express.json());

app.use(
    session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})



//set template engine

app.set('view engine' , 'ejs');

//Router Prefix
app.use('', require('./routes/routes'));
app.use(express.static(__dirname + '/public'));
app.use(express.static('uploads'));

// starting the server
app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
});
