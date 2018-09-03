"use strict";

import {
  Usuario
} from "../sqldb";
import {
  Repositorio
} from "../sqldb";
import config from "../config/environment";
import TokenController from "./token";
import qs from "querystringify";
import https from "https";
import Sequelize from "sequelize";
import {
  signToken
} from "../auth/auth.service";

var fetch = require("node-fetch");

const agent = new https.Agent({
  rejectUnauthorized: false
});

function getJson() {
  return function (resultado) {
    return resultado.json();
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function authenticateGitlab(code, type) {
  return new Promise((resolver, rechazar) => {
    let objRes = {};
    require("ssl-root-cas").inject();

    console.log("______", Object.keys(config[type]));

    let data = qs.stringify({
      client_id: config[type].clientId,
      client_secret: config[type].clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: config[type].callback
    });
    fetch(config[type].token_url, {
        method: "POST",
        agent,
        strictSSL: false,
        body: data
      })
      .then(getJson())
      .then(token => {
        objRes.token = token.access_token;
        fetch(
            config[type].api_url + "user?access_token=" + token.access_token, {
              agent,
              strictSSL: false
            }
          )
          .then(getJson())
          .then(responseGitlab => {
            resolver({
              token: objRes.token,
              usuario: responseGitlab
            });
          })
          .catch(err => {
            rechazar(err);
          });
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

function nuevoUsuario(usuarioOauth, tipo) {
  return new Promise((resolver, rechazar) => {
    let objGitlab = {};
    objGitlab.nombre = usuarioOauth.name;
    objGitlab.email = usuarioOauth.email;
    objGitlab.password = "";
    objGitlab.tipo = "gitlab";
    objGitlab.role = "usuario";
    objGitlab.login = usuarioOauth.login;
    objGitlab.cuentas = [tipo];
    objGitlab.avatar = usuarioOauth.avatar_url;
    objGitlab.url = usuarioOauth.html_url;
    objGitlab.gitlab = true;
    objGitlab.estado = true;
    objGitlab.id_gitlab = usuarioOauth.id;
    Usuario.create(objGitlab)
      .then(respUsuario => {
        resolver(respUsuario);
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

function addUser(usuario, tipo) {
  return function (userOauth) {
    let token = userOauth.token;
    let cuenta = [];
    cuenta = usuario.cuentas;
    return TokenController.updateCreateToken(tipo, usuario, token).then(
      resp => {
        return Usuario.findOne({
            where: {
              _id: usuario._id
            }
          })
          .then(user => {
            cuenta.push(tipo);
            user.cuentas = cuenta;
            user.id_gitlab = userOauth.usuario.id;
            user.gitlab = true;
            user.save();
            console.log("object", user);
            return user;
          })
          .catch(err => {
            console.log("err", err);
            return err;
          });
      }
    );
  };
}

function createUpdateUser(type) {
  return function (response) {
    let usuarioOauth = response.usuario;
    let token = response.token;
    const Op = Sequelize.Op;
    return Usuario.findOne({
        where: {
          [Op.or]: [{
            id_gitlab: usuarioOauth.id
          }, {
            email: usuarioOauth.email
          }]
        }
      })
      .then(user => {
        if (user !== null) {
          return TokenController.updateCreateToken(type, user, token).then(
            resp => {
              if (resp) {
                user.gitlab = true;
                user.estado=true;
                user.id_gitlab = usuarioOauth.id;
                user.save();
              }
              return user;
            }
          );
          //actualizar usuario
        } else {
          return nuevoUsuario(usuarioOauth, type)
            .then(user => {
              return TokenController.updateCreateToken(type, user, token).then(() => {
                return user;
              });
            })
            .catch(err => {
              console.log(err);
              return err;
            });
        }
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  };
}

// login de usuario
export function authLoginGitlab(req, res) {
  let code = req.body.code;
  let type = req.body.type;
  authenticateGitlab(code, type)
    .then(createUpdateUser(type))
    .then(result => {
      let token = signToken(result);
      res.json({
        usuario: result,
        token
      });
    })
    .catch(err => {
      res.send(err);
    });
}
// adicciona de usuario
export function authAddGitlab(req, res) {
  let code = req.body.code;
  let type = req.body.type;
  let usuario = req.body.usuario;
  authenticateGitlab(code, type)
    .then(addUser(usuario, type))
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
}

function refreshToken(code, usuario, tipo) {
  return new Promise((resolver, rechazar) => {
    require("ssl-root-cas").inject();
    let data = qs.stringify({
      client_id: config[tipo].clientId,
      client_secret: config[tipo].clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: config[tipo].callback
    });
    fetch(config[tipo].token_url, {
        method: "POST",
        agent,
        strictSSL: false,
        body: data
      })
      .then(getJson())
      .then(resp => {
        let token = resp.access_token;
        TokenController.updateCreateToken("gitlab", usuario, token).then(() => {
          resolver(token);
        });
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

export function refreshGitlab(req, res) {
  refreshToken(req.body.code, req.body.usuario, req.body.tipo)
    .then(
      token => {
        res.json({
          token,
          usuario: req.body.usuario
        });
      },
      error => {
        console.log("error", error);
        res.send(error);
      }
    )
    .catch(err => {
      console.log("err:", err);
      res.send(err);
    });
}

export function getMembers(req, res) {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  let token = req.body.token;
  let idProyecto = req.params.id_proyecto;
  fetch(
      "https://gitlab.geo.gob.bo/api/v4/projects/" +
      idProyecto +
      "/members?access_token=" +
      token, {
        agent,
        strictSSL: false
      }
    )
    .then(getJson())
    .then(response => {
      res.send(response);
    })
    .catch(err => {});
}

function creaGitlab(usuario, tipo) {
  return async function (repositorios) {
    for (const repo of repositorios) {
      let objRepositorio = {
        id_repositorio: repo.id,
        nombre: repo.name,
        descripcion: repo.description || " ",
        avatar: repo.avatar_url,
        tipo: tipo,
        estado: true,
        html_url: repo.web_url,
        git_url: repo.ssh_url_to_repo,
        api_url: config[tipo].api_url + "projects/",
        is_fork: repo.hasOwnProperty('forked_from_project') ? true : false,
        forks: {
          url: config[tipo].api_url + "projects/" + repo.id + "/forks",
          total: 0
        },
        hooks: config[tipo].api_url + "projects/" + repo.id + "/hooks",
        tags: repo.tag_list || " ",
        issues: {
          url: config[tipo].api_url + "projects/" + repo.id + "/issues",
          total: 0
        },

        branches: config[tipo].api_url + "projects/" + repo.id + "/repository/branches",
        lenguajes: {
          url: config[tipo].api_url + "projects/" + repo.id + "/languages" || "",
          datos: ""
        },
        stars: {
          url: "",
          total: repo.star_count
        },
        commits: {
          url: config[tipo].api_url +
            "projects/" +
            repo.id +
            "/repository/commits",
          total: 0
        },

        downloads: {
          url: "",
          total: 0
        },
        fk_usuario: usuario._id
      };

      await Repositorio.findOne({
          where: {
            id_repositorio: objRepositorio.id_repositorio,
            fk_usuario: usuario._id
          }
        })
        .then(repo => {
          if (repo !== null) {
            return Repositorio.update(objRepositorio, {
              where: {
                _id: repo._id
              }
            });
          } else {
            objRepositorio.visibilidad = false;
            return Repositorio.create(objRepositorio);
          }
        })
        .catch();
    }
    return;
  };
}

export function adicionaGitlab(token, usuario, tipo) {
  return new Promise((resolver, rechazar) => {
    console.log(config[tipo].api_url, token);
    fetch(config[tipo].api_url + "user?access_token=" + token, {
        agent,
        strictSSL: false
      })
      .then(getJson())
      .then(responseGitlab => {
        if (responseGitlab.message) rechazar(responseGitlab);
        fetch(
            config[tipo].api_url +
            "users/" +
            responseGitlab.id +
            "/projects" +
            "?access_token=" +
            token, {
              agent,
              strictSSL: false
            }
          )
          .then(getJson())
          .then(creaGitlab(usuario, tipo))
          .then(resp => {
            resolver("se agrego correctamente los repositorios");
          })
          .catch(err => {
            rechazar(err);
          });
      })
      .catch(err => {
        console.log(err);
        rechazar(err);
      });
  });
}