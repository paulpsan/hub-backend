"use strict";
import { Usuario, Repositorio } from "../sqldb";
import Sequelize from "sequelize";
import TokenController from "./token";
import config from "../config/environment";
import qs from "querystringify";
var fetch = require("node-fetch");

let headersClient = qs.stringify(
  {
    client_id: config.github.clientId,
    client_secret: config.github.clientSecret
  },
  true
);

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}

function authenticateGithub(code) {
  return new Promise((resolver, rechazar) => {
    let data = qs.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code: code
    });
    let objRes = {};
    let promesa = fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: data
    });
    promesa
      .then(resp => {
        return resp.text();
      })
      .then(token => {
        objRes.token = qs.parse(token).access_token;
        if (objRes.token) {
          fetch("https://api.github.com/user?access_token=" + objRes.token)
            .then(getJson())
            .then(responseGithub => {
              resolver({
                token: objRes.token,
                usuario: responseGithub
              });
            })
            .catch(err => {
              rechazar(err);
            });
        }
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

function nuevoUsuario(usuarioOauth) {
  return new Promise((resolver, rechazar) => {
    let objGithub = {};
    objGithub.nombre = usuarioOauth.name;
    objGithub.email = usuarioOauth.email;
    objGithub.password = "";
    objGithub.tipo = "github";
    objGithub.role = "usuario";
    objGithub.login = usuarioOauth.login;
    objGithub.cuentas = ["local", "github"];
    objGithub.avatar = usuarioOauth.avatar_url;
    objGithub.url = usuarioOauth.html_url;
    objGithub.github = true;
    objGithub.id_github = usuarioOauth.id;
    Usuario.create(objGithub)
      .then(respUsuario => {
        resolver(respUsuario);
      })
      .catch(err => {
        console.log(err);
        rechazar(err);
      });
  });
}

function createUpdateUser() {
  return function(response) {
    let usuarioOauth = response.usuario;
    let token = response.token;
    const Op = Sequelize.Op;
    return Usuario.findOne({
      where: {
        [Op.or]: [{ id_github: usuarioOauth.id }, { email: usuarioOauth.email }]
      }
    })
      .then(user => {
        console.log("object", user);
        if (user !== null) {
          //actualizar usuario
          return TokenController.updateCreateToken("github", user, token).then(
            resp => {
              if (resp) {
                user.github = true;
                user.id_github = usuarioOauth.id;
                user.save();
              }
              return user;
            }
          );
        } else {
          return nuevoUsuario(usuarioOauth, token)
            .then(user => {
              console.log(user);
              return TokenController.updateCreateToken(
                "github",
                user,
                token
              ).then(resp => {
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

function addUser(usuario) {
  return function(userOauth) {
    let token = userOauth.token;
    let cuenta = [];
    cuenta = usuario.cuentas;
    return TokenController.updateCreateToken("github", usuario, token).then(
      resp => {
        return Usuario.findOne({
          where: {
            _id: usuario._id
          }
        })
          .then(user => {
            cuenta.push(tipo);
            user.cuentas = cuenta;
            user.id_github = userOauth.usuario.id;
            user.github = true;
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

function refreshToken(code, usuario) {
  return new Promise((resolver, rechazar) => {
    let data = qs.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code: code
    });
    let promesa = fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: data
    });
    promesa
      .then(resp => {
        return resp.text();
      })
      .then(resp => {
        let token = qs.parse(resp).access_token;
        return TokenController.updateCreateToken("github", usuario, token).then(
          result => {
            resolver(token);
          }
        );
      })
      .catch(err => {
        rechazar(err);
      });
  });
}
//obtiene usuarioOauth de github
export function authLoginGithub(req, res) {
  let code = req.body.code;
  let type = req.body.type;
  authenticateGithub(code)
    .then(createUpdateUser())
    .then(result => {
      if (!result.errors) res.json({ usuario: result });
      else res.status(500).send(result.errors);
    })
    .catch(err => {
      res.send(err);
    });
}

export function authAddGithub(req, res) {
  let code = req.body.code;
  let type = req.body.type;
  let usuario = req.body.usuario;
  authenticateGithub(code, res)
    .then(addUser(usuario))
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      res.send(err);
    });
}

export function refreshGithub(req, res) {
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

function creaGithub(usuario) {
  return async function(repositorios) {
    for (const repo of repositorios) {
      let objRepositorio = {
        id_repositorio: repo.id,
        nombre: repo.name,
        descripcion: repo.description || "",
        avatar: "",
        tipo: "github",
        estado: true,
        html_url: repo.html_url,
        git_url: repo.git_url,
        api_url: repo.url,
        forks: {
          url: repo.forks_url,
          total: 0
        },
        hooks: repo.hooks_url,
        tags: repo.tags_url,
        issues: {
          url: repo.url + "/issues",
          total: 0
        },
        branches: repo.url + "/branches",
        lenguajes: {
          url: repo.languages_url,
          datos: ""
        },
        stars: {
          url: "",
          total: repo.stargazers_count
        },
        commits: {
          url: repo.url + "/commits",
          total: 0
        },
        downloads: {
          url: repo.url + "/downloads",
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
    }
    return;
  };
}
export function adicionaGithub(token, usuario) {
  return new Promise((resolver, rechazar) => {
    console.log(token);
    fetch("https://api.github.com/user?access_token=" + token)
      .then(getJson())
      .then(responseGithub => {
        console.log(responseGithub);
        fetch(
          "https://api.github.com/users/" +
            responseGithub.login +
            "/repos" +
            "?access_token=" +
            token
        )
          .then(getJson())
          .then(creaGithub(usuario))
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
