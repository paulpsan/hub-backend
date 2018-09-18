'use strict';

var express = require('express');
var controller = require('../controllers/proyecto');
import {
  generarOpciones
} from '../components/sequelize-middleware';
import * as autenticacion from '../auth/auth.service';
var router = express.Router();

router.get('/test', controller.test);
router.get('/', autenticacion.isAuthenticated(), generarOpciones, controller.index);

router.get('/:id', autenticacion.isAuthenticated(), controller.show);

router.get('/:id/repositorio', controller.setDatos);
router.post('/', autenticacion.isAuthenticated(), controller.create);
router.put('/:id', autenticacion.isAuthenticated(), controller.upsert);
router.patch('/:id', autenticacion.isAuthenticated(), controller.patch);

router.delete('/:id', autenticacion.isAuthenticated(), controller.destroy);

module.exports = router;