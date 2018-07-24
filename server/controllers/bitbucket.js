"use strict";

import { Usuario, Repositorio } from "../sqldb";
import Sequelize from "sequelize";
import TokenController from "./token";
import config from "../config/environment";
import request from "request";

var fetch = require("node-fetch");

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}

function addUser(usuario) {
  return function(userOauth) {
    let token = userOauth.token;
    TokenController.updateCreateToken("bitbucket", usuario, token);
    return Usuario.findOne({
      where: {
        _id: usuario._id
      }
    })
      .then(user => {
        user.id_bitbucket = userOauth.usuario.account_id;
        user.bitbucket = true;
        user.save();
        return user;
      })
      .catch(err => {
        console.log("err", err);
        return err;
      });
  };
}
function authenticateBitbucket(code) {
  return new Promise((resolver, rechazar) => {
    let objRes = {};
    request.post(
      `https://bitbucket.org/site/oauth2/access_token`,
      {
        auth: {
          username: config.bitbucket.clientId,
          password: config.bitbucket.clientSecret
        },
        form: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: config.bitbucket.callback
        }
      },
      (err, resp, body) => {
        const data = JSON.parse(body);
        objRes.token = data.access_token;
        if (objRes.token) {
          fetch(
            "https://api.bitbucket.org/2.0/user?access_token=" + objRes.token
          )
            .then(getJson())
            .then(responseBitbucket => {
              resolver({
                token: objRes.token,
                usuario: responseBitbucket
              });
            })
            .catch(err => {
              rechazar(err);
            });
        } else rechazar(err);
      }
    );
  });
}
function createUpdateUser() {
  return function(response) {
    console.log("response", response);
    let usuarioOauth = response.usuario;
    let token = response.token;
    //obtener email
    const Op = Sequelize.Op;
    return Usuario.findOne({
      where: {
        id_bitbucket: usuarioOauth.account_id
      }
    })
      .then(user => {
        if (user !== null) {
          //eliminar password
          TokenController.updateCreateToken("bitbucket", user, token);
          user.bitbucket = true;
          user.id_bitbucket = usuarioOauth.account_id;
          user.save();
          console.log(user);
          return user;
        } else {
          return nuevoUsuario(usuarioOauth, token)
            .then(user => {
              TokenController.createToken("bitbucket", user, token);
              return user;
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

export function singOauthBitbucket(req, res) {
  let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  Usuario.findOne({
    where: {
      id_bitbucket: usuarioOauth.account_id
    }
  })
    .then(user => {
      if (user !== null) {
        //eliminar password
        TokenController.updateCreateToken("bitbucket", result, token);
        res.json({ token: token, usuario: user });
      } else {
        return nuevoUsuario(usuarioOauth, token)
          .then(result => {
            TokenController.createToken("bitbucket", result, token);
            res.json({ usuario: result, token: token });
          })
          .catch(err => {
            res.send(err);
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
}

export function authLoginBitbucket(req, res) {
  let code = req.body.code;
  let type = req.body.type;
  authenticateBitbucket(code)
    .then(createUpdateUser())
    .then(result => {
      res.json({ usuario: result });
    })
    .catch(err => {
      res.send(err);
    });
}

export function authAddBitbucket(req, res) {
  let code = req.body.code;
  let type = req.body.type;
  let usuario = req.body.usuario;
  authenticateBitbucket(code, type)
    .then(addUser(usuario))
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      res.send(err);
    });
}

function refreshToken(code, usuario) {
  return new Promise((resolver, rechazar) => {
    request.post(
      `https://bitbucket.org/site/oauth2/access_token`,
      {
        auth: {
          username: config.bitbucket.clientId,
          password: config.bitbucket.clientSecret
        },
        form: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: config.bitbucket.callback
        }
      },
      (err, resp, body) => {
        const data = JSON.parse(body);
        let token = data.access_token;
        TokenController.updateCreateToken("bitbucket", usuario, token);
        resolver(token);
      }
    );
  });
}

export function refreshBitbucket(req, res) {
  refreshToken(req.body.code, req.body.usuario)
    .then(
      token => {
        res.json({ token, usuario: req.body.usuario });
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

function nuevoUsuario(usuarioOauth, token) {
  return new Promise((resolver, rechazar) => {
    let objBitbucket = {};
    objBitbucket.nombre = usuarioOauth.display_name;
    objBitbucket.email = "";
    objBitbucket.password = "";
    objBitbucket.tipo = "bitbucket";
    objBitbucket.role = "usuario";
    objBitbucket.login = usuarioOauth.username;
    objBitbucket.cuentas = ["local", "bitbucket"];
    objBitbucket.avatar = usuarioOauth.links.avatar.href;
    objBitbucket.url = usuarioOauth.links.html.href;
    objBitbucket.bitbucket = true;
    objBitbucket.id_bitbucket = usuarioOauth.account_id;
    fetch("https://api.bitbucket.org/2.0/user/emails?access_token=" + token)
      .then(getJson())
      .then(result => {
        objBitbucket.email = result.values[0].email;
        Usuario.create(objBitbucket)
          .then(respUsuario => {
            resolver(respUsuario);
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
function creaBitbucket(usuario) {
  return async function(repositorios) {
    let i = 0;
    for (const repo of repositorios.values) {
      let objRepositorio = {
        id_repositorio: i,
        nombre: repo.name,
        descripcion: repo.description,
        avatar: repo.links.avatar.href,
        tipo: "bitbucket",
        visibilidad: false,
        estado: true,
        html_url: repo.links.html.href,
        git_url: repo.links.clone[1].href,
        api_url: repo.links.self.href,
        forks: {
          url: repo.links.forks.href,
          total: 0
        },
        hooks: repo.links.hooks.href,
        tags: repo.links.tags.href,
        issues: {
          url:
            config.bitbucket.api_url +
            "repositories/" +
            repo.full_name +
            "/issues",
          total: 0
        },

        branches: repo.links.branches.href,
        lenguajes: {
          url: "",
          datos: repo.language
        },
        stars: {
          url: "",
          total: 0
        },
        commits: {
          url: repo.links.commits.href,
          total: 0
        },
        downloads: {
          url: repo.links.downloads.href,
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
            // console.log("objRepositorio", objRepositorio);
            objRepositorio.visibilidad = false;
            return Repositorio.create(objRepositorio);
          }
        })
        .catch();
      i++;
    }
    return;
  };
}

export function adicionaBitbucket(token, usuario) {
  return new Promise((resolver, rechazar) => {
    fetch("https://api.bitbucket.org/2.0/user?access_token=" + token)
      .then(getJson())
      .then(responseGitlab => {
        fetch(responseGitlab.links.repositories.href + "?access_token=" + token)
          .then(getJson())
          .then(creaBitbucket(usuario))
          .then(resp => {
            resolver("se agrego correctamente los repositorios");
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
