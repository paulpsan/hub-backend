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
  Usuario,
  Solicitud,
  UsuarioGrupo,
  Proyecto,
  Grupo
} from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import Captcha from "../components/service/captcha";
import Gitlab from "../components/service/gitlab";
import Email from "../components/service/email";
import config from "../config/environment";
import qs from "querystring";
import Git from "../components/nodegit/git";
import UserGitlab from "../components/gitlab/userGitlab";
import Sequelize from "sequelize";


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

function transferir(idUsuario) {
  return function (entity) {
    return Solicitud.find({
        where: {
          fk_usuario: entity._id
        }
      }).then(solicitud => {
        solicitud.fk_usuario = idUsuario
        solicitud.save();
        console.log(entity);
        UsuarioGrupo.update({
          admin: false,
        }, {
          where: {
            fk_usuario: entity._id,
            admin: true
          }
        })
        UsuarioGrupo.update({
          admin: true,
        }, {
          where: {
            fk_usuario: idUsuario,
            admin: false
          }
        })
        entity.admin_grupo = false
        entity.save();
        Usuario.update({
          admin_grupo: true
        }, {
          where: {
            _id: idUsuario
          }
        })
        return entity;
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  };
}

function block(res, updates) {
  return function (entity) {
    if (entity) {
      return UserGitlab.block(updates._id)
        .then(updated => {
          entity.estado = "bloqueado"
          entity.save();
          res.send(201).end();
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  };
}

function unblock(res, updates) {
  return function (entity) {
    if (entity) {
      return UserGitlab.unblock(updates._id)
        .then(updated => {
          entity.estado = "habilitado"
          entity.save();
          res.send(201).end();
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
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
    console.log("handleError", err);
    res.status(statusCode).send(err);
  };
}

// Gets a list of Usuarios y busca usuario
export function index(req, res) {
  console.log("Session**", req.session);
  if (req.query.buscar != undefined) {
    console.log(req.query);
    const Op = Sequelize.Op;
    return Usuario.findAndCountAll({
        include: [{
          all: true
        }],
        attributes: {
          exclude: ['password']
        },
        offset: req.opciones.offset,
        limit: req.opciones.limit,
        where: {
          estado: 'habilitado',
          admin: false,
          nombre: {
            [Op.iLike]: "%" + req.query.buscar + "%"
          }
        }
      })
      .then(datos => {
        console.log(datos);
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    console.log("req", req.usuario);
    return Usuario.findAndCountAll({
          include: [{
            all: true
          }],
          attributes: {
            exclude: ['password']
          },
          where: {
            estado: 'habilitado',
            admin: false,
          },
          // order: [["clasificacion", "desc"]],
          offset: req.opciones.offset,
          limit: req.opciones.limit
        },
        "_id nombre email"
      )
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

export function indexAll(req, res) {
  console.log("Session**", req.session);
  if (req.query.buscar != undefined) {
    console.log(req.query);
    const Op = Sequelize.Op;
    return Usuario.findAndCountAll({
        include: [{
          all: true
        }],
        attributes: {
          exclude: ['password']
        },
        offset: req.opciones.offset,
        limit: req.opciones.limit,
        where: {
          admin: false,
          nombre: {
            [Op.iLike]: "%" + req.query.buscar + "%"
          }
        }
      })
      .then(datos => {
        console.log(datos);
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    console.log("req", req.usuario);
    return Usuario.findAndCountAll({
          include: [{
            all: true
          }],
          attributes: {
            exclude: ['password']
          },
          where: {
            admin: false,
          },
          // order: [["clasificacion", "desc"]],
          offset: req.opciones.offset,
          limit: req.opciones.limit
        },
        "_id nombre email"
      )
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
    include: [{
      all: true
    }],
    attributes: {
      exclude: ['password']
    },
    where: {
      _id: req.params.id,
    }
  };
  return Usuario.find(Object.assign(opciones, req.opciones))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getProjects(req, res) {
  return Proyecto.findAll({
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

export function getGrupos(req, res) {
  return Grupo.findAll({
      include: [{
        model: Usuario,
        where: {
          _id: req.params.id
        },
        // include: [{
        //   model: UsuarioGrupo,
        //   where: {
        //     admin: true,
        //   }
        // }]
      }],
      // include: [{
      //   all: true
      // }],
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


export function captchaUser(req, res) {
  console.log("req", req.sessionID);
  var captchaSession = Captcha.create();
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
    Email.verify(token)
      .then(resp => {
        console.log("respUser", resp);
        bcrypt.hash(password, null, null, (err, hash) => {
          password = hash;
          if (resp) {
            Usuario.update({
                password: password,
                estado: 'habilitado'
              }, {
                attributes: {
                  exclude: ['password']
                },
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
        });
      })
      .catch(err => {
        res.status(409).send({
          message: "No Existe el token o Token Expirado"
        });
      });
  } else {
    res.status(409).send({
      message: "El Password es requerido"
    });
  }
}
export function recoverUser(req, res) {
  console.log("req", req.body.email);
  const email = req.body.email;
  return Usuario.findOne({
    attributes: {
      exclude: ['password']
    },
    where: {
      email: email
    }
  }).then(user => {
    console.log(user);
    if (user !== null) {
      const obj = {
        _id: user._id,
        email: user.email
      };
      Email.sendRecover(obj).then(resp => {
        if (resp)
          res.status(200).json({
            message: "Se le envió la información a su correo Electrónico "
          });
        else
          res.status(500).json({
            message: "Existe un error Intente de Nuevo "
          });
      });
    } else {
      res.status(409).json({
        message: `No existe registro del Correo Electrónico ${email}`
      });
    }
  });
}

export function verifyUser(req, res) {
  let token = req.query.token.split("?")[0];
  Email.verify(token)
    .then(resp => {
      console.log("respUser", resp);
      if (resp) {
        UserGitlab.create(resp)
          .then(userGitlab => {
            console.log("userGitlab", userGitlab);
            bcrypt.hash(resp.password, null, null, (err, hash) => {
              let obj = {
                nombre: userGitlab.name,
                login: userGitlab.username,
                email: userGitlab.email,
                password: hash,
                user_gitlab: true,
                _id: userGitlab.id,
                estado: 'habilitado',
              }
              console.log(obj);
              Usuario.create(obj);
              // Email.delete(token);
              res.send({
                message: "Usuario Verificado Exitosamente",
                usuario: obj
              });
            })
          })
          .catch(err => {
            console.log("err", err);
            res.status(409).send({
              message: "No se pudo confirmar usuario vuelva a registrase",
              err
            });
          });

      } else {
        console.log("resp", resp);
        res.status(409).send({
          message: "No Existe el token o Token Expirado"
        });
      }
    })
    .catch(err => {
      res.status(409).send({
        message: "No Existe el token o Token Expirado"
      });
    });
}
// Creates a new Usuario in the DB
export function create(req, res) {
  let captchaCurrent;
  Captcha.getCurrent(req.body.sessionID)
    .then(resp => {
      captchaCurrent = JSON.parse(resp).captcha;
      console.log("captcha!!!!", req.body.captcha, captchaCurrent);
      if (req.body.captcha === captchaCurrent && captchaCurrent) {
        Captcha.delete(req.body.sessionID);

        let obj = new Object();
        let params = req.body;
        obj.nombre = params.nombre;
        obj.login = params.username || "";
        obj.email = params.email.toLowerCase();
        obj.password = params.password;

        Usuario.findOne({
          attributes: {
            exclude: ['password']
          },
          where: {
            email: obj.email
          }
        }).then(userfind => {
          if (userfind === null) {
            return Email.sendToken(obj)
              .then(resp => {
                console.log(resp);
                return res.send({
                  message: "Se envio el mensaje de verificacion"
                });
              })
              .catch(handleError(res));
          } else {
            res.status(409).send({
              message: "El Username o el Correo Electrónico ya esta en uso"
            });
          }
        })


        //set status = "sin verificar"

        // UserGitlab.verifyUserEmail(obj)
        //   .then(resp => {
        //     console.log("resp  ", resp);
        //     if (resp) {
        //       if (
        //         obj.nombre != null &&
        //         obj.email != null &&
        //         obj.password != null
        //       ) {
        //         return Usuario.findOne({
        //           where: {
        //             email: obj.email
        //           }
        //         }).then(userfind => {
        //           console.log("user", userfind);
        //           if (userfind === null) {
        //             return Usuario.create(obj)
        //               .then(user => {

        //               })
        //               .then(respondWithResult(res, 201))
        //               .catch(handleError(res));
        //           } else {
        //             res.status(409).send({
        //               message: "El Correo Electrónico ya esta en uso"
        //             });
        //           }
        //         });
        //       } else {
        //         res.status(409).send({
        //           message: "Introduce todos los campos"
        //         });
        //       }
        //     }
        //   })
        //   .catch(err => {
        //     console.log("err  ", err);
        //     res.status(409).send({
        //       message: err.message
        //     });
        //   });
      } else {
        res.status(409).send({
          message: "Captcha Invalido o Expirado"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(409).send({
        message: "Captcha Expirado"
      });
    });
}
export function passwordUser(req, res) {
  console.log(req.body.usuario);
  let usuario = req.body.usuario;
  if (usuario.password) {
    // envia verificacion a correo
    bcrypt.hash(usuario.password, null, null, (err, hash) => {
      const password = hash;
      return Usuario.findOne({
        attributes: {
          exclude: ['password']
        },
        where: {
          _id: usuario._id
        }
      }).then(user => {
        if (user !== null) {
          user.password = password;
          user.save();
          res.send({
            message: "Se almaceno Correctamente"
          });
        } else {
          res.status(409).send({
            message: "No existe el usuario"
          });
        }
      });
    });
  }
}
export function createGitlab(req, res) {
  let captchaCurrent;
  Captcha.getCurrent(req.body.usuario.sessionID)
    .then(resp => {
      console.log(req.body.usuario.captcha, resp);
      captchaCurrent = JSON.parse(resp).captcha;
      if (req.body.usuario.captcha === captchaCurrent && captchaCurrent) {
        console.log("entro.......");
        Captcha.delete(req.body.usuario.sessionID);
        Gitlab.createGitlabUser(
            req.body.domain,
            req.body.token,
            req.body.usuario
          )
          .then(resp => {
            if (resp.message) {
              res.status(409).send(resp);
            }
            res.send(resp);
          })
          .catch(err => {
            res.status(409).send(err);
          });
      } else {
        res.status(409).send({
          message: "Captcha Invalido o Expirado"
        });
      }
    })
    .catch(err => {
      res.status(409).send({
        message: "Captcha Expirado"
      });
    });
}
export function clone(req, res) {
  // Github.clone();
  // res.send({
  //   message: "se realizo correctamente"
  // });
}

// Upserts the given Usuario in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Usuario.upsert(req.body, {
      attributes: {
        exclude: ['password']
      },
      where: {
        _id: req.params.id
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
// Updates an existing Usuario in the DB
export function transferencia(req, res) {
  return Usuario.find({
      attributes: {
        exclude: ['password']
      },
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(transferir(req.params.id_transferencia))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Usuario in the DB
export function patch(req, res) {
  return Usuario.find({
      attributes: {
        exclude: ['password']
      },
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function blockUser(req, res) {
  return Usuario.find({
      attributes: {
        exclude: ['password']
      },
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(block(res, req.body))
    .catch(handleError(res, 404));
}
export function unblockUser(req, res) {
  return Usuario.find({
      attributes: {
        exclude: ['password']
      },
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(unblock(res, req.body))
    .catch(handleError(res, 404));
}
// Deletes a Usuario from the DB
export function destroy(req, res) {
  return Usuario.find({
      attributes: {
        exclude: ['password']
      },
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}