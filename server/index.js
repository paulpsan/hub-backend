'use strict'
// const app = require('./app');
// const Sequelize = require('sequelize');
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log(env);

module.exports=require('./app');