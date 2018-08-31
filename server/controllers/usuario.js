/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/usuarios              ->  index
 * POST    /api/usuarios              ->  create
 * GET     /api/usuarios/:id          ->  show
 * PUT     /api/usuarios/:id          ->  upsert
 * PATCH   /api/usuarios/:id          ->  patch
 * DELETE  /api/usuarios/:id          ->  destroy
 */

"use strict";

import bcrypt from "bcrypt-nodejs";
import {
  Usuario
} from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import captcha from "../components/service/captcha";
import Gitlab from "../components/service/gitlab"
import Email from "../components/service/email"
import config from "../config/environment";
import qs from "querystring";


function getJson() {
  return function (resultado) {
    return resultado.json();
  };
}

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

function removeEntity(res) {
  return function (entity) {
    let usuario = {};
    usuario._id = entity._id;
    usuario.email = entity.email;
    usuario.estado = false;
    if (entity) {
      return entity
        .updateAttributes(usuario)
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
    console.log("handleError", err.errors);
    res.status(statusCode).send(err);
  };
}

// Gets a list of Usuarios y busca usuario
export function index(req, res) {
  console.log("Session**", req.session);
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Usuario.findAndCountAll({
        include: [{
          all: true
        }],
        offset: req.opciones.offset,
        limit: req.opciones.limit,
        where: {
          estado: true,
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
    console.log("req", req.usuario);
    return Usuario.findAndCountAll({
        // include: [{ all: true }],
        where: {
          estado: true
        },
        // order: [["clasificacion", "desc"]],
        offset: req.opciones.offset,
        limit: req.opciones.limit
      }, '_id nombre email')
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

// Gets a single Usuario from the DB
export function show(req, res) {
  let opciones = {
    where: {
      _id: req.params.id
    }
  };
  return Usuario.find(Object.assign(opciones, req.opciones))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


export function captchaUser(req, res) {
  console.log("req", req.sessionID);
  var captchaSession = captcha.create();
  req.session.captcha = captchaSession.text;
  res.status(200).json({
    id: req.sessionID,
    captcha: captchaSession.data
  });
}

export function recoverPassword(req, res) {
  console.log("req", req.body.password);
  console.log("req", req.body.token);
  const token = req.body.token;
  let password = req.body.password;
  if (password) {
    Email.verify(token).then(resp => {
      console.log("respUser", resp);
      bcrypt.hash(password, null, null, (err, hash) => {
        password = hash;
        if (resp) {
          Usuario.update({
              password: password,
              estado: true
            }, {
              where: {
                _id: resp._id
              }
            })
            .then(resp => {
              if (resp[0] === 0) {
                //delete token!!
                res.send({
                  message: "Usuario no Encontrado"
                });
              } else {
                res.send({
                  message: "Cambio de Password Exitosamente"
                });
              }
            })
            .catch(err => {
              console.log(err);
              res.send({
                message: err
              });
            });


          // 
        } else {
          res.status(409).send({
            message: "No Existe el token o Token Expirado"
          });
        }

      })

    }).catch(err => {
      res.status(409).send({
        message: "No Existe el token o Token Expirado"
      });
    })
  } else {
    res.status(409).send({
      message: "El Password es requerido"
    });
  }

}
export function recoverUser(req, res) {
  console.log("req", req.body.email);
  const email = req.body.email
  return Usuario.findOne({
    where: {
      email: email
    }
  }).then(user => {
    if (user) {
      const obj = {
        _id: user._id,
        email: user.email
      }
      Email.sendRecover(obj).then(resp => {
        if (resp)
          res.status(200).json({
            message: "Se le envió la información a su correo Electrónico "
          });
        else
          res.status(200).json({
            message: "Existe un error Intente de Nuevo "
          });
      })
    } else {
      res.status(200).json({
        message: `No existe registro del Correo Electrónico ${email}`
      });
    }
  });
}

export function verifyUser(req, res) {
  let token = req.query.token;
  Email.verify(token).then(resp => {
    console.log("respUser", resp);
    if (resp) {
      Usuario.update({
          estado: true
        }, {
          where: {
            _id: resp._id
          }
        })
        .then(resp => {
          if (resp[0] === 0) {
            res.send({
              message: "Usuario no Encontrado"
            });
          } else {
            res.send({
              message: "Usuario Verificado Exitosamente"
            });
          }
        })
        .catch(err => {
          console.log(err);
          res.send({
            message: err
          });
        });


      // 
    } else {
    console.log("resp", resp);

      res.status(409).send({
        message: "No Existe el token o Token Expirado"
      });
    }
  }).catch(err => {
    res.status(409).send({
      message: "No Existe el token o Token Expirado"
    });
  })
}
// Creates a new Usuario in the DB
export function create(req, res) {
  let captchaCurrent;
  console.log(req.body.sessionID);
  captcha.getCurrent(req.body.sessionID).then(resp => {
    console.log(resp);
    captchaCurrent = JSON.parse(resp).captcha
    if (req.body.captcha === captchaCurrent && captchaCurrent) {
      let obj = new Object();
      let params = req.body;
      obj.nombre = params.nombre;
      obj.login = params.username || ''
      obj.email = params.email.toLowerCase();
      obj.password = params.password;
      obj.cuentas = ["local"];
      obj.role = "usuario";
      if (params.password) {
        // envia verificacion a correo
        bcrypt.hash(params.password, null, null, (err, hash) => {
          obj.password = hash;
          if (!obj.nombre && !obj.email && !obj.password) {
            return Usuario.findOne({
              where: {
                email: obj.email
              }
            }).then(user => {
              if (user) {
                return Usuario.create(obj)
                  .then(user => {
                    return Email.send(user).then(resp => {
                      console.log(resp);
                      return user;
                    }).catch(handleError(res))
                  })
                  .then(respondWithResult(res, 201))
                  .catch(handleError(res));
              } else {
                res.status(409).send({
                  message: "El Correo Electrónico ya esta en uso"
                });
              }
            })
          } else {
            res.status(409).send({
              message: "Introduce todos los campos"
            });
          }
        });
      }
    } else {
      res.status(409).send({
        message: "Captcha Invalido o Expirado"
      });
    }

  }).catch(err => {
    console.log(err);
    res.status(409).send({
      message: "Captcha Expirado"
    });
  })
}

export function createGitlab(req, res) {
  let captchaCurrent;
  captcha.getCurrent(req.body.usuario.sessionID).then(resp => {
    console.log(req.body.usuario.captcha, resp);
    captchaCurrent = JSON.parse(resp).captcha
    if (req.body.usuario.captcha === captchaCurrent && captchaCurrent) {
      console.log("entro.......");
      Gitlab.createGitlabUser(req.body.domain, req.body.token, req.body.usuario)
        .then(resp => {
          console.log(resp);
          res.send(resp);
        })
        .catch(err => {
          res.status(409).send(err);
        })

    } else {
      res.status(409).send({
        message: "Captcha Invalido o Expirado"
      });
    }

  }).catch(err => {
    res.status(409).send({
      message: "Captcha Expirado"
    });
  })
}

// Upserts the given Usuario in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Usuario.upsert(req.body, {
      where: {
        _id: req.params.id
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Usuario in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Usuario.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Usuario from the DB
export function destroy(req, res) {
  return Usuario.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}