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
