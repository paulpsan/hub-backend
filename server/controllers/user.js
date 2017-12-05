'use strict'

import express from 'express';
import { User } from '../sqldb'
function ejemplo (req,res) {
    res.status(200).send({
        mesagge:'prueba de la api'
    });
}

function obtener(req,res){
    User.findAll().then(users => {
        res.status(200).send({
            user:users
        });
        console.log(users)
      })
}

module.exports={
    ejemplo,
    obtener
};