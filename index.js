const express = require('express');
const redis = require('redis');
const axios = require('axios');
const passport = require('passport');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
require('./google-aouth-setup');

// start redis client
const redisClient = redis.createClient(6379);
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  }));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// cache middleware
function cache(req, res, next) {
    const { id } = req.params;

    redisClient.get(id, (error, data) => {
        if (error) throw error;

        if (data != null) {
            return res.json(JSON.parse(data));
        }
        next();
    });
}

// auth middleware
function isLoddedIn(req, res, next) {
    if(req.user) next();
    res.sendStatus(401);
}

// hello route
app.get('/', (req, res) => res.send("HELLO!"));

// auth gagal route
app.get('/gagal', (req, res) => res.sendStatus(401));
// auth berhasil route
app.get('/berhasil', isLoddedIn, (req, res) => {
    res.json(req.user);
});

// google auth routes
app.get('/google', passport.authenticate('google', { scope: ['email', 'profile']}));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/gagal'}), (req, res) => {
    res.redirect('/berhasil');
});

// google logout route
app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
});

app.get('/rahasia', isLoddedIn, (req, res) => res.send("INI HALAMAN RAHASIA!"));

app.get('/users/:id', cache, (req, res) => {
    const { id } = req.params;
    axios.get(`https://reqres.in/api/users/${id}`).then((response) => {
        const data = response.data;
        // set data to redis server
        redisClient.setex(id, 5,JSON.stringify(data));

        // return result
        res.json(data);
    });
});



// start server
app.listen(3000);