'use strict'
import express from 'express';
import userController from '../controllers/user';
const api = express.Router();


// api.get('/inicio',userController.ejemplo);
api.get('/inicio',userController.obtener);

module.exports=api;