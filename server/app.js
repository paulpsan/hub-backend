'use strict'

import express from 'express';
import bodyParser from 'body-parser';
import user_routes from './routes/user'

// const express = require('express');
// const bodyParser = require('body-parser');

const app = express();

//cargar rutas

//comvertir datos a Json
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// app.get('/', function(req, res) {
//     res.send("estoy probando");
// });
// rutas base
app.use('/api',user_routes)


module.exports=app;
