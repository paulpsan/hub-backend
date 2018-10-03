'use strict';

var express = require('express');
var controller = require('../controllers/proyecto');
import {
  generarOpciones
} from '../components/sequelize-middleware';
var router = express.Router();

router.get('/', generarOpciones, controller.publicProject);

router.get('/:id', controller.show);

module.exports = router;