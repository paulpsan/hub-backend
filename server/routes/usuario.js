"use strict";

var express = require("express");
var controller = require("../controllers/usuario");
import { generarOpciones } from "../components/sequelize-middleware";
import { md_auth } from "../components/middleware/authenticated";
var router = express.Router();

/**
 * @api {get} /usuarios Obtener una lista paginada de usuarios
 * @apiName usuarios
 * @apiGroup Usuarios
 *
 * @apiParam (query) {String} [ordenar_por] Campo por el cual se debe ordenar la respuesta
 * @apiParam (query) {String} [orden="DESC"] Campo para cambiar el orden de los datos "ASC" ascendente y "DESC" descendente
 * @apiParam (query) {Number} [pagina=0] Numero de pagina que se debe retornar
 * @apiParam (query) {Number} [numero=10] Numero de elementos por página
 * @apiParam (query) {String} [incluir] Nombre de las entidades relacionadas a incluir, separadas por comas ",".
 * @apiParam (query) {String} [atributos] Nombre de los campos que se deben retornar.
 * @apiSuccess (200) {Object[]} datos Lista de los usuarios
 * @apiSuccess (200) {Number} datos._id Id del usuario
 * @apiSuccess (200) {String} datos.nombre Nombre del usuario
 * @apiSuccess (200) {String} datos.email Correo electronico del usuario
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
      "_id": 1,
      "nombre": "D'jalmar Gutierrez",
      "email": "dgutierrez@adsib.gob.bo",
      "createdAt": "2017-04-19T19:55:46.581Z",
      "updatedAt": "2017-04-19T19:55:46.581Z",
      "fk_organizacion": null
    },
    {
      "_id": 2,
      "nombre": "Teodoro Nina",
      "email": "tnina@adsib.gob.bo",
      "createdAt": "2017-04-19T19:55:46.581Z",
      "updatedAt": "2017-04-19T19:55:46.581Z",
      "fk_organizacion": null
    },
    {
      "_id": 3,
      "nombre": "Edwin Salcedo",
      "email": "esalcedo@adsib.gob.bo",
      "createdAt": "2017-04-19T19:55:46.581Z",
      "updatedAt": "2017-04-19T19:55:46.581Z",
      "fk_organizacion": null
    },
    {
      "_id": 4,
      "nombre": "Jhonny Monrroy",
      "email": "jmonrroy@adsib.gob.bo",
      "createdAt": "2017-04-19T19:55:46.581Z",
      "updatedAt": "2017-04-19T19:55:46.581Z",
      "fk_organizacion": null
    },
    {
      "_id": 5,
      "nombre": "Andrea Soria",
      "email": "asoria@adsib.gob.bo",
      "createdAt": "2017-04-19T19:55:46.581Z",
      "updatedAt": "2017-04-19T19:55:46.581Z",
      "fk_organizacion": null
    }
  ],
  "paginacion": {
    "total": 5,
    "cantidad": 5,
    "porPagina": 20,
    "paginaActual": 1,
    "totalPaginas": 1
  }
}
 */
router.get("/", generarOpciones, controller.index);
/**
 * @api {get} /usuarios/:id Obtener un usuario por id
 * @apiName usuario
 * @apiGroup Usuarios
 *
 * @apiParam {Number} id Id unico del usuario
 * @apiSuccess (200) {Number} _id Id del reporitorio
 * @apiSuccess (200) {String} nombre Nombre del usuario
 * @apiSuccess (200) {String} email Correo electronico del usuario
 * @apiSuccessExample {json} Success-Response:
 * {
    "_id": 1,
    "nombre": "D'jalmar Gutierrez",
    "email": "dgutierrez@adsib.gob.bo",
    "createdAt": "2017-04-19T19:55:46.581Z",
    "updatedAt": "2017-04-19T19:55:46.581Z",
    "fk_organizacion": null
  }
 */
router.get("/:id", generarOpciones, controller.show);
/**
 * @api {post} /usuarios Crear un usuario
 * @apiName Crear usuario
 * @apiGroup Usuarios
 *
 * @apiParam {String} nombre Nombre del usuario
 * @apiParam {String} email Correo electronico del usuario
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * {
    "_id": 1,
    "nombre": "D'jalmar Gutierrez",
    "email": "dgutierrez@adsib.gob.bo",
    "createdAt": "2017-04-19T19:55:46.581Z",
    "updatedAt": "2017-04-19T19:55:46.581Z",
    "fk_organizacion": null
  }
 */
router.get("/graficos/:id", controller.graficos);

router.post("/", controller.create);

router.post("/login", controller.login);

router.post("/datosgithub", controller.datosGithub);

router.post("/commits/:id/github", controller.commitsGithub);

router.post("/commits/:id/gitlab", controller.commitsGitlab);

router.put("/:id", controller.upsert);
router.patch("/:id", controller.patch);
/**
 * @api {delete} /usuarios Eliminar un usuario
 * @apiName Eliminar usuario
 * @apiGroup Usuarios
 *
 * @apiParam {String} id Id del usuario
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 */
router.delete("/:id", controller.destroy);

module.exports = router;
