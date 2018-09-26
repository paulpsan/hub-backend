/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/grupos              ->  index
 * POST    /api/grupos              ->  create
 * GET     /api/grupos/:id          ->  show
 * PUT     /api/grupos/:id          ->  upsert
 * PATCH   /api/grupos/:id          ->  patch
 * DELETE  /api/grupos/:id          ->  destroy
 */

"use strict";

import GroupGitlab from "../components/gitlab/groupGitlab";
import MemberGitlab from "../components/gitlab/memberGitlab";
import ProjectGitlab from "../components/gitlab/projectGitlab";
import SequelizeHelper from "../components/sequelize-helper";
import Sequelize from "sequelize";
import {
  Grupo,
  Solicitud,
  Proyecto,
  UsuarioGrupo,
  UsuarioProyecto,
  ProyectoGrupo
} from "../sqldb";
import config from "../config/environment";

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  // console.log("esto es un",entity);
  return function (entity) {
    if (entity) {
      return res
        .status(statusCode)
        .json(entity)
        .end();
    }
    return null;
  };
}

function saveUpdates(updates) {
  return function (entity) {
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

function saveUser(updates) {
  return function (entity) {
    if (entity) {
      return MemberGitlab.editGroup(updates).then(resp => {
        console.log(entity);
        console.log(updates);
        entity.access_level = updates.access_level;
        entity.nombre = updates.nombre;
        entity.save();
        return entity
      }).catch(err => {
        console.log(err);
        throw new err;
      })
    } else {
      return entity
    }
  };
}

function saveProject(updates) {
  return function (entity) {
    if (entity) {
      return ProjectGitlab.edit(updates).then(resp => {
        entity.visibilidad = resp.visibility;
        Proyecto.update({
          visibilidad: resp.visibility
        }, {
          where: {
            _id: entity.fk_proyecto
          }
        })
        entity.save();
        return entity
      }).catch(err => {
        console.log(err);
        throw new err;
      })
    } else {
      return entity
    }
  };
}

function saveGitlab(updates) {
  return function (entity) {
    return GroupGitlab.edit(updates).then(resp => {
      entity.visibilidad = JSON.parse(resp).visibility;
      console.log(resp);
      return entity
    }).catch(err => {
      console.log(err);
      throw new err;
    })
  };
}

function addUsuarioGrupo(usuarios) {
  return async function (entity) {
    for (const usuario of usuarios) {
      let obj = {
        fk_usuario: usuario._id,
        fk_grupo: entity._id,
        nombre_permiso: "desarrollador",
        access_level: 30,
      }
      await UsuarioGrupo.create(obj)
        .then(resp => {
          console.log(resp);
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
    return entity;
  };
}

function addUsuarioProject(usuarios) {
  return async function (entity) {
    console.log(usuarios);
    if (usuarios) {
      for (const usuario of usuarios) {
        let obj = {
          fk_usuario: usuario._id,
          fk_proyecto: entity._id,
          nombre_permiso: "desarrollador",
          access_level: 30,
        }
        await UsuarioProyecto.create(obj)
          .then(resp => {
            console.log(resp);
          })
          .catch(err => {
            console.log(err);
            return err;
          });
      }
    }
    return entity;
  };
}

function removeEntity(res) {
  return function (entity) {
    let grupo = {};
    grupo._id = entity._id;
    grupo.email = entity.email;
    grupo.estado = false;
    if (entity) {
      return entity
        .updateAttributes(grupo)
        .then(updated => {
          console.log("--------", updated);
          return updated;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  };
}

function removeUser(res, req) {
  return function (entity) {
    if (entity) {
      return MemberGitlab.deleteGroup(req.params.id_grupo, req.params.id_usuario).then(resp => {
        console.log(resp);
        return entity.destroy().then(() => {
          res.status(204).end();
        }).catch(err => {
          console.log(err);
          throw err;
        });
      }).catch(err => {
        console.log(err);
        throw err;
      })
    } else {
      return entity
    }
  };
}

function createGitlab(project, isNew) {
  return new Promise((resolve, reject) => {
    ProjectGitlab.create(project, isNew)
      .then(resp => {
        if (resp.message) {
          reject(resp.message);
        }
        MemberGitlab.addProject(JSON.parse(resp).id, project.usuarios)
        resolve(resp);
      })
      .catch(err => {
        reject(err);
      });
  });
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

function setGrupo() {
  return new Promise((resolver, rechazar) => {
    Grupo.find().then(resp => {
      console.log(resp);
    });
  });
}

export function setGrupo(req, res) {
  return Grupo.find()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of grupos y busca grupo
export function index(req, res) {
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Grupo.findAndCountAll({
        include: [{
          all: true
        }],
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
    return Grupo.findAndCountAll({
        include: [{
          all: true
        }],
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

// Obtiene una lista de Usuarios de un grupo y busca
export function getUsers(req, res) {
  return Grupo.find({
      include: [{
        all: true
      }],
      where: {
        _id: req.params.id
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getProjects(req, res) {
  const Op = Sequelize.Op;
  return Grupo.find({
      where: {
        _id: req.params.id
      }
    })
    .then(grupo => {
      return Proyecto.findAll({
        include: [{
          all: true
        }],
        where: {
          path: {
            [Op.iLike]: grupo.path + "%"
          }
        }
      })
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
  // return ProyectoGrupo.findAll({
  //     include: [{
  //       all: true
  //     }],
  //     where: {
  //       fk_grupo: req.params.id
  //     }
  //   })
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}
// Gets a single Grupo from the DB
export function show(req, res) {
  let opciones = {
    include: [{
      all: true
    }],
    where: {
      _id: req.params.id
    }
  };
  return Grupo.find(Object.assign(opciones, req.opciones))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getGroup(req, res) {
  return UsuarioGrupo.find({
      include: [{
        all: true
      }],
      where: {
        fk_usuario: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


export function setUser(req, res) {
  let user = [{
    user_id: req.body._id,
    access_level: req.body.access_level,
  }]
  //adicionar usuario al grupo
  return MemberGitlab.addGroup(req.params.id, user)
    .then(async resp => {
      console.log(resp);
      if (resp) {
        let obj = {
          fk_usuario: req.body._id,
          fk_grupo: req.params.id,
          nombre_permiso: req.body.nombre_permiso,
          access_level: req.body.access_level,
        }
        console.log(obj);
        await UsuarioGrupo.create(obj)
      }
      return resp
    }).then(respondWithResult(res, 201))
    .catch(err => {
      console.log(err);
      res.status(err.statusCode).send(err);
    })
}

// Creates a new Grupo in the DB
export function create(req, res) {

  console.log(req.body.usuarios);
  GroupGitlab.create(req.body).then(resp => {
    console.log(resp);
    req.body._id = resp.id;
    //adicionar usuario al grupo
    MemberGitlab.addGroup(resp.id, req.body.usuarios).then(resp => {
      console.log(resp);
      if (resp) {
        let objGrupo = {
          nombre: req.body.nombre,

        }
        console.log(objGrupo);
        return Grupo.create(req.body)
          .then(addUsuarioGrupo(req.body.usuarios))
          .then(respondWithResult(res, 201))
          .catch(handleError(res));
      }
    }).catch(err => {
      res.status(400).send(err);
    })

  }).catch(err => {
    console.log(err);
    res.status(400).send(err);
  })
}
export function createProject(req, res) {
  Proyecto.find({
    where: {
      path: req.body.path
    }
  }).then(proy => {
    if (!proy) {
      createGitlab(req.body)
        .then(resp => {
          req.body._id = JSON.parse(resp).id
          //correcto
          console.log(req.body);
          return Proyecto.create(req.body)
            .then(addUsuarioProject(req.body.usuarios))
            .then(response => {
              let data = {
                fk_grupo: req.params.id,
                fk_proyecto: req.body._id,
                visibilidad: "public"
              }
              ProyectoGrupo.create(data)
              res.status(201)
                .json({
                  proyecto: response
                });
            })
            .catch(err => {
              console.log(err);
              res.status(400).send(err);
            });
        })
        .catch(handleError(res))

    } else {
      res.status(400).send({
        message: req.body.path + " ya existe"
      });
    }
  })
}

export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Grupo.upsert(req.body, {
      where: {
        _id: req.params.id
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function patch(req, res) {
  console.log(req.body);
  return Grupo.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveGitlab(req.body))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function patchUser(req, res) {
  return UsuarioGrupo.find({
      where: {
        fk_usuario: req.params.id_usuario,
        fk_grupo: req.params.id_grupo
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUser(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function patchProject(req, res) {
  return ProyectoGrupo.find({
      where: {
        fk_proyecto: req.params.id_proyecto,
        fk_grupo: req.params.id_grupo
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveProject(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// Deletes a Grupo from the DB
export function destroyUser(req, res) {
  return UsuarioGrupo.find({
      where: {
        fk_usuario: req.params.id_usuario,
        fk_grupo: req.params.id_grupo
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeUser(res, req))
    .catch(handleError(res));
}

export function destroy(req, res) {
  return Grupo.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}