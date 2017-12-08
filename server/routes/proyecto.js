'use strict';

var express = require('express');
var controller = require('../controllers/proyecto');
import {
  generarOpciones
} from '../components/sequelize-middleware';

var router = express.Router();
/**
 * @api {get} /proyectos Obtener una lista paginada de proyectos
 * @apiName Proyectos
 * @apiGroup Proyectos
 *
 * @apiParam (query) {String} [ordenar_por] Campo por el cual se debe ordenar la respuesta
 * @apiParam (query) {String} [orden="DESC"] Campo para cambiar el orden de los datos "ASC" ascendente y "DESC" descendente
 * @apiParam (query) {Number} [pagina=0] Numero de pagina que se debe retornar
 * @apiParam (query) {Number} [numero=10] Numero de elementos por página
 * @apiParam (query) {String} [incluir] Nombre de las entidades relacionadas a incluir, separadas por comas ",".
 * @apiParam (query) {String} [atributos] Nombre de los campos que se deben retornar.
 * @apiSuccess (200) {Object[]} datos Lista de los proyectos
 * @apiSuccess (200) {Number} datos._id Id del proyecto
 * @apiSuccess (200) {String} datos.urlRepositorio Url del repositorio
 * @apiSuccess (200) {String} datos.descripcion Breve descripción del proyecto
 * @apiSuccess (200) {Number} datos.fk_usuario Id del usuario creador
 * @apiSuccess (200) {Number} datos.fk_repositorio Id del repositorio que se origina
 * @apiSuccess (200) {Object} datos.datos Datos obtenidos del repositorio de origen(commits, contribuyentes, etc)
 * @apiSuccess (200) {Object} paginacion Objeto que contiene informacion de la paginacion.
 * @apiSuccess (200) {Number} paginacion.total Cantidad total de registros
 * @apiSuccess (200) {Number} paginacion.cantidad Cantidad de elementos retornados
 * @apiSuccess (200) {Number} paginacion.porPagina Cantidad de elementos retornados por página
 * @apiSuccess (200) {Number} paginacion.paginaActual Pagina en la cual nos encontramos
 * @apiSuccess (200) {Number} paginacion.totalPagina Cantidad total de paginas que se pueden solicitar
 * @apiSuccessExample {json} Success-Response:
 * {
  "datos": [
    {
      "_id": 9,
      "urlRepositorio": "https://dgutierrez@gitlab.geo.gob.bo/bolivia-hub/bolivia-hub-backend.git",
      "descripcion": "Backend de bolivia hub",
      "datos": {
        "id": 912,
        "tags": [],
        "grupo": {
          "id": 350,
          "kind": "group",
          "name": "bolivia-hub",
          "path": "bolivia-hub",
          "full_path": "bolivia-hub"
        },
        "icono": "https://gitlab.geo.gob.bo/uploads/project/avatar/912/git.jpg",
        "nombre": "bolivia-hub-backend",
        "commits": [...],
        "usuarios": [...],
       },
      "createdAt": "2017-04-17T15:05:40.895Z",
      "updatedAt": "2017-04-17T15:05:40.895Z",
      "fk_usuario": 6,
      "fk_repositorio": 4
    }
  ],
  "paginacion": {
    "total": 1,
    "cantidad": 1,
    "porPagina": 20,
    "paginaActual": 1,
    "totalPaginas": 1
  }
}
 */
router.get('/', generarOpciones, controller.index);

/**
 * @api {get} /proyectos/:id Obtener un proyecto por id
 * @apiName Proyecto
 * @apiGroup Proyectos
 *
 * @apiParam {Number} id Id unico del proyecto
 * @apiParam (query) {String} [incluir] Nombre de las entidades relacionadas a incluir, separadas por comas ",".
 * @apiParam (query) {String} [atributos] Nombre de los campos que se deben retornar.
 * @apiSuccess (200) {Number} _id Id del proyecto
 * @apiSuccess (200) {String} urlRepositorio Url del repositorio
 * @apiSuccess (200) {String} descripcion Breve descripción del proyecto
 * @apiSuccess (200) {Number} fk_usuario Id del usuario creador
 * @apiSuccess (200) {Number} fk_repositorio Id del repositorio que se origina
 * @apiSuccess (200) {Object} datos Datos obtenidos del repositorio de origen(commits, contribuyentes, etc)
 * @apiSuccessExample {json} Success-Response:
 * {
    "_id": 9,
    "urlRepositorio": "https://dgutierrez@gitlab.geo.gob.bo/bolivia-hub/bolivia-hub-backend.git",
    "descripcion": "Backend de bolivia hub",
    "datos": {
      "id": 912,
      "tags": [],
      "grupo": {
        "id": 350,
        "kind": "group",
        "name": "bolivia-hub",
        "path": "bolivia-hub",
        "full_path": "bolivia-hub"
      },
      "icono": "https://gitlab.geo.gob.bo/uploads/project/avatar/912/git.jpg",
      "nombre": "bolivia-hub-backend",
      "commits": [...],
      "usuarios": [...],
      },
    "createdAt": "2017-04-17T15:05:40.895Z",
    "updatedAt": "2017-04-17T15:05:40.895Z",
    "fk_usuario": 6,
    "fk_repositorio": 4
  }
 */
router.get('/:id', controller.show);
/**
 * @api {post} /proyectos Crear un proyecto
 * @apiName Crear Proyecto
 * @apiGroup Proyectos
 *
 * @apiParam {String} urlRepositorio Url del repositorio, el enlace https para clonar el proyecto (https://dgutierrez@gitlab.geo.gob.bo/SistemaGestionAdministrativa/ModuloPersonal.git)
 * @apiParam {String} descripcion Breve descripción del proyecto
 * @apiParam {Number} fk_usuario Id del usuario creador
 * @apiParam {Number} fk_repositorio Id del repositorio de origen(gitlab, githab, etc)
 * @apiSuccess (201) {Number} _id Id del proyecto
 * @apiSuccess (201) {String} urlRepositorio Url del repositorio
 * @apiSuccess (201) {String} descripcion Breve descripción del proyecto
 * @apiSuccess (201) {Number} fk_usuario Id del usuario creador
 * @apiSuccess (201) {Number} fk_repositorio Id del repositorio que se origina
 * @apiSuccess (201) {Object} datos Datos obtenidos del repositorio de origen(commits, contribuyentes, etc)
 * @apiSuccessExample {json} Success-Response:
 * {
    "_id": 9,
    "urlRepositorio": "https://dgutierrez@gitlab.geo.gob.bo/bolivia-hub/bolivia-hub-backend.git",
    "descripcion": "Backend de bolivia hub",
    "datos": {
      "id": 912,
      "tags": [],
      "grupo": {
        "id": 350,
        "kind": "group",
        "name": "bolivia-hub",
        "path": "bolivia-hub",
        "full_path": "bolivia-hub"
      },
      "icono": "https://gitlab.geo.gob.bo/uploads/project/avatar/912/git.jpg",
      "nombre": "bolivia-hub-backend",
      "commits": [...],
      "usuarios": [...],
      },
    "createdAt": "2017-04-17T15:05:40.895Z",
    "updatedAt": "2017-04-17T15:05:40.895Z",
    "fk_usuario": 6,
    "fk_repositorio": 4
  }
 */
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
/**
 * @api {delete} /proyectos/:id Elimina un proyecto
 * @apiName Eliminar un proyecto
 * @apiGroup Proyectos
 *
 * @apiParam {Number} id Id del proyecto
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 204 OK
 */
router.delete('/:id', controller.destroy);

module.exports = router;
