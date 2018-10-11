"use strict";
import {
  Proyecto,
  Repositorio,
  ProyectoGrupo,
  Commit,
  Rating,
  UsuarioProyecto
} from "../sqldb";
import config from "../config/environment";
import SequelizeHelper from "../components/sequelize-helper";
import _ from "lodash";
import Sequelize from "sequelize";
import UserGitlab from "../components/gitlab/userGitlab";
import ProjectGitlab from "../components/gitlab/projectGitlab";
import MemberGitlab from "../components/gitlab/memberGitlab";
import CommitGitlab from "../components/gitlab/commitGitlab"
import Git from "../components/nodegit/git";
import Documento from "../components/pdf/documento";
var fs = require('fs');
const path = require("path");

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    console.log(entity);
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}
//remover proyectos y usuarios
function removeEntity(res, id) {
  return function (entity) {
    if (entity) {
      return ProjectGitlab.delete(id)
        .then(resp => {
          console.log(resp);
          return entity.destroy().then(() => {
            UsuarioProyecto.destroy({
                where: {
                  fk_proyecto: id
                }
              })
              .catch(err => {
                console.log(err);
                throw err;
              })
            res.status(204).end();
          }).catch(err => {
            console.log(err);
            throw err;
          });
        }).catch(err => {
          console.log(err);
          throw err;
        })
    }
  };
}

function removeUser(res, id_usuario, id_proyecto) {
  return function (entity) {
    return MemberGitlab.deleteProyect(id_usuario, id_proyecto).then(resp => {
      console.log(resp);
      return entity.destroy().then(() => {
        res.status(204).end();
      });
    }).catch(err => {
      console.log(err);
      throw err;
    })
  };
}

function generaDocumentos(res) {
  return function (entity) {
    if (entity) {
      return Documento.generate("asd", "asd").then(resp => {
        let file = fs.readFileSync(resp.filename);
        var pathNoImagen = path.resolve(__dirname, "../../documento.pdf");
        console.log(file.toString('base64'));
        // res.send({
        //   filename: 'documento.pdf',
        //   data: file
        // });
        res.sendFile(pathNoImagen);
        return entity;
      })
    }
  };
}

function setCommits(proyecto) {
  return function (repo) {
    console.log(repo);
    if (repo) {
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
          // proyecto.fechaCreacion = commits[commits.length - 1].fecha;
          // proyecto.ultimaActividad = commits[0].fecha;
          proyecto.commits = commits;
          //carga los usuarios que hicieron commits
          // let usuarios = [];
          for (const commit of commits) {
            commit.fk_proyecto = proyecto._id
            commit.save();
          }
          // proyecto.usuarios = _.uniq(usuarios);
          proyecto.save();
          return proyecto;
        })
        .catch(err => {
          return err;
        })
      );
    } else {
      return null;
    }
  };
}

function getDatosCommit() {
  return function (proyecto) {
    return (
      Commit.findAll({
        where: {
          fk_proyecto: proyecto._id
        }
      })
      .then(commits => {
        // let datos = {
        //   issues: repo.issues,
        //   stars: repo.stars,
        //   forks: repo.forks,
        //   downloads: repo.downloads,
        //   lenguajes: repo.lenguajes
        // };
        proyecto.commits = commits;
        //carga los usuarios que hicieron commits
        // let usuarios = [];
        // for (const commit of commits) {
        //   usuarios.push(commit.autor);
        // }
        // proyecto.usuarios = _.uniq(usuarios);
        proyecto.save();
        return proyecto;
      })
      .catch(err => {
        throw err
      })
    );
  };
}

function crearCommit(objCommit) {
  return Commit.findOne({
      where: {
        sha: objCommit.sha,
        fk_proyecto: objCommit.fk_proyecto
      }
    })
    .then(respCommit => {
      if (respCommit === null) {
        return Commit.create(objCommit).catch(err => {
          throw err
        });
      } else {
        return respCommit.update(objCommit).catch(err => {
          throw err
        });
      }
    })
    .catch(err => {
      console.log(err);
      throw err
    });
}

function setDatosCommits(proyecto) {
  return async function (commits) {
    for (const commit of commits) {
      let objCommit = {
        sha: commit.id,
        autor: commit.author_name || "",
        mensaje: commit.message,
        fecha: commit.committed_date,
        estado: true,
        id_usuario: proyecto.fk_usuario,
        fk_proyecto: proyecto._id
      };
      await crearCommit(objCommit);
    }
    return proyecto;
  }
}

function setDatosCommit() {
  return function (proyecto) {
    return CommitGitlab.get(proyecto._id)
      .then(setDatosCommits(proyecto))
      .catch(err => {
        console.log("_______", err);
        return err;
      });
  };
}

function setDatosRepos() {
  return function (proyecto) {
    console.log(proyecto);
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
  return function (repositorio) {
    console.log("setMavx***", repositorio.downloads, rating);
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
  return function (repo) {
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
  return function (entity) {
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

function createGitlab(project) {
  return new Promise((resolve, reject) => {
    ProjectGitlab.create(project)
      .then(resp => {
        if (resp.message) {
          reject(resp.message);
        }
        MemberGitlab.addProject(JSON.parse(resp).id, project.usuarios)
        resolve(resp);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function createEntity(res, proyecto) {
  return function (entity) {
    if (!entity) {
      return Proyecto.create(proyecto)
        .then(setDatosRepo())
        .then(setRating())
        .then(response => {
          res.status(201).json({
            proyecto: response
          });
        })
        .catch(err => {
          console.log(err);
          res.status(400).send(err);
        });
    } else {
      res.status(400).send({
        message: entity.nombre + " ya existe"
      });
    }
    return entity;
  };
}

function createAssociation(data) {
  return async function (entity) {
    if (data.usuarios) {
      for (const usuario of data.usuarios) {
        let obj = {
          fk_usuario: usuario._id,
          fk_proyecto: entity._id,
          access_level: 30,
          nombre_permiso: "desarrollador"
        }
        console.log(obj);
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
    let obj = {
      fk_usuario: data.usuario._id,
      fk_proyecto: entity._id,
      access_level: 40,
      nombre_permiso: "mantenedor"
    }
    UsuarioProyecto.create(obj)

    return entity;
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

function saveGitlab(updates) {
  return function (entity) {
    return ProjectGitlab.edit(updates).then(resp => {
      if (resp.message) {
        throw new err;
      } else {
        entity.visibilidad = resp.visibility;
        console.log(resp);
        return entity
      }
    }).catch(err => {
      console.log(err);
      throw new err;
    })
  };
}

function saveUser(updates) {
  return function (entity) {
    return MemberGitlab.editProject(updates).then(resp => {
      console.log(entity, resp);
      entity.access_level = updates.access_level;
      entity.nombre = updates.nombre;
      entity.save();
      return entity
    }).catch(err => {
      console.log(err);
      return err
    })
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).send({
        message: "no se encuentra lo requerido"
      });
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    console.log(err);
    if (err.error) {
      res.status(err.statusCode).send(err.error);
    } else {
      res.status(statusCode).send(err);
    }
  };
}

export function index(req, res) {
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Proyecto.findAndCountAll({
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
    return Proyecto.findAndCountAll({
        include: [{
          all: true
        }],
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

export function publicProject(req, res) {
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Proyecto.findAndCountAll({
        include: [{
          all: true
        }],
        offset: req.opciones.offset,
        limit: req.opciones.limit,
        where: {
          nombre: {
            [Op.iLike]: "%" + req.query.buscar + "%"
          },
          visibilidad: "public"
        }
      })
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    return Proyecto.findAndCountAll({
        include: [{
          all: true
        }],
        // order: [["clasificacion", "desc"]],
        offset: req.opciones.offset,
        limit: req.opciones.limit,
        where: {
          visibilidad: "public"
        }
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
      include: [{
        all: true
      }],
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function addlicence(req, res) {
  return Proyecto.find({
      where: {
        _id: req.params.id
      }
    }).then(project => {
      return ProjectGitlab.addLicence(project._id, req.body).then(resp => {
        console.log(resp);
        project.licencias = {
          nombre: "LPGBolivia",
          url: req.body.path + "/licencia.pdf"
        }
        project.save();
        return project
      })
    })
    .then(respondWithResult(res))
}
export function unprotect(req, res) {
  return Proyecto.find({
      where: {
        _id: req.params.id
      }
    }).then(project => {
      return ProjectGitlab.branchProtect(project._id,true,true).then(resp => {
        console.log(resp);
        
        return project
      })
    })
    .then(respondWithResult(res))
}
// Creates a new Proyecto in the DB
//parsear datos
export function create(req, res) {
  Proyecto.find({
    where: {
      nombre: req.body.nombre,
      path: req.body.path
    }
  }).then(proy => {
    if (!proy) {
      createGitlab(req.body)
        .then(resp => {
          req.body._id = JSON.parse(resp).id
          // return ProjectGitlab.addLicence(req.body._id, req.body.usuario).then(resp => {
          //   console.log(resp);
          //   req.body.licencias = {
          //     nombre: "LPGBolivia",
          //     url: req.body.path + "/licencia.pdf"
          //   }
          console.log(req.body);
          return Proyecto.create(req.body)
            .then(createAssociation(req.body))
            .then(response => {
              res
                .status(201)
                .json({
                  proyecto: response
                });
            })
            .catch(err => {
              console.log(err);
              res.status(400).send(err);
            });
        })
        // })
        .catch(err => {
          console.log(err);
          res.status(400).send({
            message: err.error.message
          });
        });

    } else {
      res.status(400).send({
        message: req.body.path + " ya existe"
      });
    }
  }).catch(err => {
    res.status(500).send({
      message: err
    });
  });
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
  return Proyecto.find({
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

export function patchUsuario(req, res) {
  return UsuarioProyecto.find({
      where: {
        fk_usuario: req.params.id_usuario,
        fk_proyecto: req.params.id_proyecto
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUser(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function destroyUser(req, res) {
  return UsuarioProyecto.find({
      where: {
        fk_usuario: req.params.id_usuario,
        fk_proyecto: req.params.id_proyecto
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeUser(res, req.params.id_usuario, req.params.id_proyecto))
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
    .then(removeEntity(res, req.params.id))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function setUser(req, res) {
  let user = [{
    _id: req.body._id,
    access_level: req.body.access_level,
  }]
  //adicionar usuario al grupo
  return MemberGitlab.addProject(req.params.id, user)
    .then(async resp => {
      console.log(resp);
      if (resp) {
        let obj = {
          fk_usuario: req.body._id,
          fk_proyecto: req.params.id,
          nombre_permiso: req.body.nombre_permiso,
          access_level: req.body.access_level,
        }
        console.log(obj);
        await UsuarioProyecto.create(obj)
      }
      return resp
    }).then(respondWithResult(res, 201))
    .catch(err => {
      console.log(err);
      if (err.error) {
        err.message = "El Usuario ya existe en el Proyecto"
      }
      res.status(err.statusCode).send(err);
    })
}
export function getDocument(req, res) {
  return Proyecto.findOne({
      include: [{
        all: true
      }],
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(generaDocumentos(res))
    .catch(handleError(res));
}

export function setDatosRepo(req, res) {
  return Proyecto.findOne({
      where: {
        _id: req.params.id
      }
    })
    .then(setDatosRepos(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function setDatos(req, res) {
  return Proyecto.findOne({
      where: {
        _id: req.params.id
      }
    })
    .then(setDatosCommit())
    .then(getDatosCommit())
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function test(req, res) {
  ProjectGitlab.create()
    .then(resp => {
      res.json({
        usuario: resp
      });
    })
    .catch(err => {
      res.status(409).send({
        message: err
      });
    });
}