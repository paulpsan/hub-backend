'use strict'

import express from 'express';
import bodyParser from 'body-parser';
import user_routes from './routes/user';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
// const express = require('express');
// const bodyParser = require('body-parser');

const app = express();

//cargar rutas// app.get('/', function(req, res) {
//     res.send("estoy probando");
// });

//comvertir datos a Json
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({ 
    secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: false //guarda informacion en la base de datos cuando nos conectamos
}));

app.use(passport.initialize());
app.use(passport.session());
require('./config/github')(passport);
// app.get('/', function(req, res) {
//     res.send("estoy probando");
// });
// rutas base
app.use('/',user_routes)


module.exports=app;
