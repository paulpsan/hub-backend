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
router.get("/:id/documento",controller.getDocument);
router.get('/:id/gitlab', controller.setDatos);
router.get('/:id/repositorio', controller.setDatosRepo);
router.post('/:id/licencias',controller.addlicence);
router.post('/', autenticacion.isAuthenticated(), controller.create);
router.post("/:id/usuarios", controller.setUser);
router.put('/:id', autenticacion.isAuthenticated(), controller.upsert);
router.patch('/:id', autenticacion.isAuthenticated(), controller.patch);
router.patch('/:id_proyecto/usuarios/:id_usuario', autenticacion.isAuthenticated(), controller.patchUsuario);

router.delete("/:id_proyecto/usuarios/:id_usuario", controller.destroyUser);
router.delete('/:id', autenticacion.isAuthenticated(), controller.destroy);

module.exports = router;