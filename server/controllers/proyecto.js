/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/proyectos              ->  index
 * POST    /api/proyectos              ->  create
 * GET     /api/proyectos/:id          ->  show
 * PUT     /api/proyectos/:id          ->  upsert
 * PATCH   /api/proyectos/:id          ->  patch
 * DELETE  /api/proyectos/:id          ->  destroy
 */

"use strict";
import jsonpatch from "fast-json-patch";
import { Proyecto, Repositorio, Usuario, Commit, Rating } from "../sqldb";
import config from "../config/environment";
import SequelizeHelper from "../components/sequelize-helper";
import ProxyService from "../components/repository-proxy/proxy-service";
import GitLab from "../components/repository-proxy/repositories/gitlab";
import _ from "lodash";
import Sequelize from "sequelize";
import { createSecureContext } from "tls";

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy().then(() => {
        res.status(204).end();
      });
    }
  };
}

function setCommits(proyecto) {
  return function(repo) {
    return (
      Commit.findAll({
        where: {
          fk_repositorio: repo._id
        }
      })
        //devuelve array de commits
        .then(commits => {
          let datos = {
            issues: repo.issues,
            stars: repo.stars,
            forks: repo.forks,
            downloads: repo.downloads,
            lenguajes: repo.lenguajes
          };
          proyecto.datos = datos;
          proyecto.fechaCreacion = commits[commits.length - 1].fecha;
          proyecto.ultimaActividad = commits[0].fecha;
          proyecto.commits = commits;
          //carga los usuarios que hicieron commits
          let usuarios = [];
          for (const commit of commits) {
            usuarios.push(commit.autor);
          }
          proyecto.usuarios = _.uniq(usuarios);
          proyecto.save();
          return proyecto;
        })
        .catch(err => {
          return err;
        })
    );
  };
}

function setDatosRepo() {
  return function(proyecto) {
    return Repositorio.findOne({
      where: {
        _id: proyecto.fk_repositorio
      }
    })
      .then(setCommits(proyecto))
      .catch(err => {
        console.log("_______", err);
        return err;
      });
  };
}
function setMaxValue(rating) {
  return function(repositorio) {
    if (rating.downloads <= repositorio.downloads.total) {
      rating.downloads = repositorio.downloads.total;
    }
    if (rating.issues <= repositorio.issues.total) {
      rating.issues = repositorio.issues.total;
    }
    if (rating.stars <= repositorio.stars.total) {
      rating.stars = repositorio.stars.total;
    }
    if (rating.forks <= repositorio.forks.total) {
      rating.forks = repositorio.forks.total;
    }
    rating.save();
    return repositorio;
  };
}
function setClasificacion(proyecto, rating) {
  return function(repo) {
    let valor;
    switch (repo.tipo) {
      case "github":
        valor =
          repo.downloads.total *
            (config.factorGithub.downloads / rating.downloads) +
          repo.issues.total * (config.factorGithub.issues / rating.issues) +
          repo.stars.total * (config.factorGithub.stars / rating.stars) +
          repo.forks.total * (config.factorGithub.forks / rating.forks);
        console.log("valor:+++", valor);

        break;
      case "gitlab":
        valor =
          repo.issues.total * (config.factorGithub.issues / rating.issues) +
          repo.stars.total * (config.factorGithub.stars / rating.stars) +
          repo.forks.total * (config.factorGithub.forks / rating.forks);
        break;
      case "bitbucket":
        valor =
          repo.downloads.total *
            (config.factorGithub.downloads / rating.downloads) +
          repo.issues.total * (config.factorGithub.issues / rating.issues) +
          repo.forks.total * (config.factorGithub.forks / rating.forks);
        break;
      default:
        break;
    }
    //multiplicamos por el valor de estrellas
    valor = valor * 5;
    proyecto.clasificacion = {
      datos: [],
      valor: Math.round(valor)
    };
    proyecto.save();
    console.log("proyecto", proyecto);
    return proyecto;
  };
}

function setRating() {
  return function(entity) {
    return Rating.find().then(rating => {
      return Repositorio.find({
        where: {
          _id: entity.fk_repositorio
        }
      })
        .then(setMaxValue(rating))
        .then(setClasificacion(entity, rating))
        .catch(err => {
          console.log(err);
        });
    });
  };
}

function createEntity(res, proyecto) {
  return function(entity) {
    if (!entity) {
      return Proyecto.create(proyecto)
        .then(setDatosRepo())
        .then(setRating())
        .then(response => {
          res.status(201).json({ proyecto: response });
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    } else {
      res.send({ mensaje: entity.nombre + " ya existe" });
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    return entity
      .updateAttributes(updates)
      .then(updated => {
        return updated;
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).send({ mensaje: "no se encuentra lo requerido" });
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    res.status(statusCode).send(err);
  };
}

export function index(req, res) {
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Proyecto.findAndCountAll({
      include: [{ all: true }],
      offset: req.opciones.offset,
      limit: req.opciones.limit,
      where: {
        nombre: {
          [Op.iLike]: "%" + req.query.buscar + "%"
        }
      }
    })
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    return Proyecto.findAndCountAll({
      include: [{ all: true }],
      // order: [["clasificacion", "desc"]],
      offset: req.opciones.offset,
      limit: req.opciones.limit
    })
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

// Gets a single Proyecto from the DB
export function show(req, res) {
  return Proyecto.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Proyecto in the DB
//parsear datos
export function create(req, res) {
  console.log("body:", req.body, "params:", req.params);
  return (
    Proyecto.find({
      where: {
        nombre: req.body.nombre
      }
    })
      //actualizar
      .then(createEntity(res, req.body))
      .catch(handleError(res))
  );
}

// Upserts the given Proyecto in the DB at the specified ID
export function upsert(req, res) {
  return Proyecto.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Proyecto in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Proyecto.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Proyecto from the DB
export function destroy(req, res) {
  return Proyecto.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function setDatos(req, res) {
  return Proyecto.findOne({
    where: {
      _id: req.params.id
    }
  })
    .then(setDatosRepo(res))
    .catch(handleError(res));
}
