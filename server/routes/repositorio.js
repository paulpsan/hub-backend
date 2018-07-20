"use strict";

var express = require("express");
var controller = require("../controllers/repositorio");
import { generarOpciones } from "../components/sequelize-middleware";

var router = express.Router();
/**
 * @api {get} /repositorios Obtener una lista paginada de repositorios
 * @apiName Repositorios
 * @apiGroup Repostorios
 *
 * @apiParam (query) {String} [ordenar_por] Campo por el cual se debe ordenar la respuesta
 * @apiParam (query) {String} [orden="DESC"] Campo para cambiar el orden de los datos "ASC" ascendente y "DESC" descendente
 * @apiParam (query) {Number} [pagina=0] Numero de pagina que se debe retornar
 * @apiParam (query) {Number} [numero=10] Numero de elementos por página
 * @apiParam (query) {String} [incluir] Nombre de las entidades relacionadas a incluir, separadas por comas ",".
 * @apiParam (query) {String} [atributos] Nombre de los campos que se deben retornar.
 * @apiSuccess (200) {Object[]} datos Lista de los repositorios
 * @apiSuccess (200) {Number} datos._id Id del reporitorio
 * @apiSuccess (200) {String} datos.nombre nombre del repositorio
 * @apiSuccess (200) {String} datos.url Url de la raiz del repositorio
 * @apiSuccess (200) {Number} datos.tipo Tipo de repositorio soportado(gitlab, github, bitbucket)
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
      "_id": 4,
      "nombre": "Gitlab GeoBolivia",
      "url": "https://gitlab.geo.gob.bo",
      "tipo": "gitlab",
      "createdAt": "2017-04-17T15:03:22.819Z",
      "updatedAt": "2017-04-17T15:03:22.819Z"
    },
    {
      "_id": 5,
      "nombre": "Gitlab",
      "url": "https://about.gitlab.com",
      "tipo": "gitlab",
      "createdAt": "2017-04-17T15:03:22.819Z",
      "updatedAt": "2017-04-17T15:03:22.819Z"
    },
    {
      "_id": 6,
      "nombre": "GitHub",
      "url": "https://github.com",
      "tipo": "github",
      "createdAt": "2017-04-17T15:03:22.819Z",
      "updatedAt": "2017-04-17T15:03:22.819Z"
    }
  ],
  "paginacion": {
    "total": 3,
    "cantidad": 3,
    "porPagina": 20,
    "paginaActual": 1,
    "totalPaginas": 1
  }
}
*/
router.get("/", generarOpciones, controller.index);
router.get("/:id/usuarios", generarOpciones, controller.indexUser);
router.get("/:id/proyectos", controller.proyectos);
/**
 * @api {get} /repositorios/:id Obtener un repositorio por id
 * @apiName Repositorio
 * @apiGroup Repostorios
 *
 * @apiParam {Number} id Id unico del repositorio
 * @apiSuccess (200) {Number} _id Id del reporitorio
 * @apiSuccess (200) {String} nombre Nombre del repositorio
 * @apiSuccess (200) {String} url Url de la raiz del repositorio
 * @apiSuccess (200) {String} tipo Tipo de repositorio
 * @apiSuccessExample {json} Success-Response:
 * {
    "_id": 4,
    "nombre": "Gitlab GeoBolivia",
    "url": "https://gitlab.geo.gob.bo",
    "tipo": "gitlab",
    "createdAt": "2017-04-17T15:03:22.819Z",
    "updatedAt": "2017-04-17T15:03:22.819Z"
  }
 */
router.get("/:id", generarOpciones, controller.show);
/**
 * @api {post} /repositorios Crear un repositorio
 * @apiName Crear Repositorio
 * @apiGroup Repostorios
 *
 * @apiParam {String} nombre Nombre del repositorio
 * @apiParam {String} url Url de la raiz del repositorio
 * @apiParam {Number} tipo Tipo de repositorio
 * @apiSuccessExample {json} Success-Response:
 * {
    "_id": 4,
    "nombre": "Gitlab GeoBolivia",
    "url": "https://gitlab.geo.gob.bo",
    "tipo": "gitlab",
    "createdAt": "2017-04-17T15:03:22.819Z",
    "updatedAt": "2017-04-17T15:03:22.819Z"
  }
 */
router.post("/", controller.create);

router.post("/oauth", controller.addOauth);
//Obtiene los lenguajes
router.post("/lenguajes", controller.lenguajes);
//carga los datos de issues,forks,downloads
router.post("/datos", controller.setDatos);

//desvincula una cuenta colocando estado=false en todos sus repositorios de un tipo
router.post("/desvincular/:tipo", controller.desvincular);

router.put("/:id", controller.upsert);
router.patch("/:id", controller.patch);
/**
 * @api {delete} /repositorios Eliminar un repositorio
 * @apiName Eliminar repositorio
 * @apiGroup Repostorios
 *
 * @apiParam {String} id Id del repositorio
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 */
router.delete("/:id", controller.destroy);

module.exports = router;
