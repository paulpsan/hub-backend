'use strict'
// const app = require('./app');
// const Sequelize = require('sequelize');
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.TZ = 'Europe/Amsterdam'; 

module.exports=require('./app');