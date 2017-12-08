/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/proyectos              ->  index
 * POST    /api/proyectos              ->  create
 * GET     /api/proyectos/:id          ->  show
 * PUT     /api/proyectos/:id          ->  upsert
 * PATCH   /api/proyectos/:id          ->  patch
 * DELETE  /api/proyectos/:id          ->  destroy
 */

'use strict';
import jsonpatch from 'fast-json-patch';
import {
  Proyecto,
  Repositorio,
  Usuario,
  UsuarioRepositorio
} from '../sqldb';
import SequelizeHelper from '../components/sequelize-helper';
import ProxyService from '../components/repository-proxy/proxy-service';
import GitLab from '../components/repository-proxy/repositories/gitlab';
import _ from 'lodash';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    console.log(err);
    res.status(statusCode).send(err);
  };
}

/**
 * Asigna los commits del proyecto a los usuarios correspondientes
 * @param {*} proyecto proyecto que contiene los commits
 */
function asignarCommitsUsuarios(proyecto) {
  var usuariosConCommits = proyecto.datos.usuarios.filter(usuario => usuario.commits.length > 0);
  let promises = usuariosConCommits.map(usuarioConCommits => {
    return Usuario.findOne({
        where: {
          email: usuarioConCommits.email
        }
      })
      .then(usuario => {
        if (usuario) {
          if (!usuario.datos || !usuario.datos.commits) {
            console.log('entra');
            usuario.datos = {
              commits: 0
            };
          }
          usuario.datos.commits += usuarioConCommits.commits.length;
          usuario.set('datos', usuario.datos);
          return usuario.save();
        }
      })
      .then(usuario => {
        if (usuario) {
          return usuario;
        }
        return Usuario.findAll({
          include: [{
            model: Repositorio,
            as: 'repositorios',
            required: true,
            through: {
              model: UsuarioRepositorio,
              where: {
                email: usuarioConCommits.email
              }
            }
          }]
        });
      })
      .then(respuesta => {
        if (!respuesta.length) {
          return respuesta;
        }
        if (respuesta.length == 0) {
          return null;
        }
        let usuario = respuesta[0]; //obtenemos el primer usuario, que es el que tiene el correo asociado a algun repositorio
        if (!usuario.datos || !usuario.datos.commits) {
          usuario.datos = {
            commits: 0
          };
        }
        usuario.datos.commits += usuarioConCommits.commits.length;
        usuario.set('datos', usuario.datos);
        return usuario.save();
      });
  });
  return Promise.all(promises);
}


export function index(req, res) {
	//return Proyecto.findAll()
	let gitlab = new GitLab('https://gitlab.geo.gob.bo', '7-VmBEpTd33s28N5dHvy');
	//obtener datos a partir de la url del proyecto. En primera instancia mandaremos el id del proyecto
	//console.log(req.query);
	var opciones={};
	if(req.query.pagina && req.query.limite){
		opciones.pagina=req.query.pagina;
		opciones.limite=req.query.limite;
	}else{
		opciones.pagina=1;
		opciones.limite=20;
	}
	if(req.query.buscar){
		opciones.buscar=req.query.buscar;
	}
	return gitlab.proyectos(opciones)
	.then(proyectos => {
		//console.log(proyectos);
		return ({paginacion:proyectos.metadatos,datos:proyectos.datos});
	  //return proyectos;
	  //return SequelizeHelper.generarRespuesta({count:proyectos.length,rows:proyectos}, req.query);
		
	})
// return Proyecto.findAndCountAll(req.opciones)
// .then(datos => {
// return SequelizeHelper.generarRespuesta(datos, req.opciones);
// })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Proyecto from the DB
export function show(req, res) {
//  return Proyecto.find({
//      where: {
//        _id: req.params.id
//      }
//    })
//    .then(proyecto => {
//      asignarCommits(proyecto);
//      return proyecto;
//    })
	//return Proyecto.findAll()
	let gitlab = new GitLab('https://gitlab.geo.gob.bo', '7-VmBEpTd33s28N5dHvy');
	//obtener datos a partir de la url del proyecto. En primera instancia mandaremos el id del proyecto
	console.log(req.params);
	return gitlab.proyectoId(req.params.id)
	.then(proyecto => {
		//console.log(proyecto);
      //asignarCommits(proyecto);
      return proyecto;
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Proyecto in the DB
export function create(req, res) {
  let proxyService;
  return Repositorio.find({
      where: {
        _id: req.body.fk_repositorio
      }
    })
    .then(repositorio => {
      proxyService = new ProxyService(req.body.urlRepositorio, repositorio);
      proxyService.validarUrl();
      return proxyService.obtenerProyecto();
    })
    .then(proyecto => {
      req.body.datos = proyecto;
      //asignar commits a los usuarios existentes por email
      //se ejecuta en segundo plano
      asignarCommitsUsuarios(req.body);
      return Proyecto.create(req.body);
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Proyecto in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

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
    .then(patchUpdates(req.body))
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
