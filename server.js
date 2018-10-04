//required npm modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuid = require('uuid/v4');
var path = require('path');

//define the port where server is running
const port = 3009;

const app = express();

var parseForm = bodyParser.urlencoded({ extended: false });

app.use(session({
    //uuid to create a session Id
    genid: (req) => {
        return uuid();
    },
    name: 'SESSION_ID',
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    if (req.session.csrfToken === undefined) {
        req.session.csrfToken = uuid();
    }
    next();

});

//route to index.html upon with /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

// The endpoint receives the session cookie and based on the session identifier return the CSRF token value.
app.post('/middle', parseForm, function (req, res) {
    var token = req.session.csrfToken; //middleware token
    res.json({ csrfToken: token });
});

app.post('/login', parseForm, function (req, res, next) {

    if((req.body.username == 'ish') && (req.body.password == '123'))
    {
        //console.log('username and password is correct');
        if (req.session.csrfToken !== req.body._csrf) {
            console.log('Invalid CSRF Token!');
            let err = new Error('Invalid CSRF Token!');
            err.status = 403;
            return next(err);
        }
        res.send(`<h1>Login Success ${req.body.username} </h1> <h5>CSRF token is valid</h5>`);
    }
    else {
        res.send(`<h1>Invalid Username or Password </h1>`);
    }

});

//server is running on port 3009
app.listen(port, () => {
    console.log(`Listening on localhost:${port}`);

});