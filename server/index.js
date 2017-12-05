'use strict'
import app from './app';
import Sequelize from 'sequelize';
import sqldb from './sqldb'
import { User } from './sqldb'
// const app = require('./app');
// const Sequelize = require('sequelize');
const port = process.env.PORT || 3000; 


sqldb.sequelize.sync({force:true})
.then(()=>{
        // Table created
        return User.create({
          firstName: 'John',
          lastName: 'Hancock'
        })
    }
)
.then(()=>{
    app.listen(port, ()=>{
        console.log('App listening on port '+port);
    });
})
.catch((error)=>{
    console.log('Server failed to start due to error: %s', error);
});

// const sequelize= new Sequelize('clases','postgres','',{
//     host:'localhost',
//     dialect: 'postgres',
//     pool:{
//         max:5,
//         min:0,
//         acquire:3000,
//         idle:10000
//     },
//     operatorsAliases: false
// })

// const sequelize = new Sequelize('postgres://postgres:@localhost:5432/clases');

// sequelize
// .authenticate()
// .then(() => {
//     console.log('Connection has been established successfully.');
//     app.listen(port, ()=>{
//         console.log('App listening on port '+port);
//     });
// })
// .catch(err => {
//     console.error('Unable to connect to the database:', err);
// });

// const User = sequelize.import('./models/user');
