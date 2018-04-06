"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import request from "request";
// import { fetch } from "node-fetch";

var base64 = require("base-64");
var fetch = require("node-fetch");

function authenticateBitbucket(code) {
  return new Promise((res, rej) => {
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
          redirect_uri: "http://localhost:4200/inicio"
        }
      },
      (err, response, body) => {
        const data = JSON.parse(body);
        console.log("oauth.auth.response", data);
        const {
          access_token,
          refresh_token,
          token_type,
          scopes,
          expires_in
        } = data;
        if (objRes.token) {
          fetch("https://api.github.com/user?access_token=" + objRes.token)
            .then(res => {
              return res.json();
            })
            .then(json => {
              // console.log("user",json)
              let objetoUsuario = {};
              objetoUsuario.nombre = json.name;
              objetoUsuario.email = json.email;
              objetoUsuario.password = "github";
              objetoUsuario.tipo = "github";
              objetoUsuario.role = "usuario";
              objetoUsuario.login = json.login;
              objRes.usuario = objetoUsuario;
              if (json.repos_url) {
                fetch(json.repos_url + headersClient)
                  .then(res => {
                    return res.json();
                  })
                  .then(repositorios => {
                    // console.log("repos", repositorios);
                    let i = 1;
                    let objDatos = [];
                    if (repositorios.length > 0) {
                      for (let value of repositorios) {
                        let objLenguajes = {};
                        let objCommits = {};
                        if (value.languages_url) {
                          fetch(value.languages_url + headersClient)
                            .then(res => {
                              return res.json();
                            })
                            .then(lenguajes => {
                              objLenguajes = lenguajes;
                              // console.log("lenguaje",lenguajes);
                              fetch(
                                "https://api.github.com/repos/" +
                                  value.full_name +
                                  "/commits" +
                                  headersClient
                              )
                                .then(res => {
                                  return res.json();
                                })
                                .then(commits => {
                                  objDatos.push({
                                    lenguajes: objLenguajes,
                                    repo: value,
                                    commits: commits
                                  });
                                  // console.log("obj", objDatos);
                                  if (i == repositorios.length) {
                                    objetoUsuario.datos = objDatos;
                                    objRes.usuario = objetoUsuario;

                                    Usuario.findOne({
                                      where: {
                                        email: objRes.usuario.email.toLowerCase(),
                                        tipo: objRes.usuario.tipo
                                      }
                                    })
                                      .then(user => {
                                        // console.log("entity", user);
                                        if (user != null) {
                                          return user.destroy().then();
                                        }
                                      })
                                      // .then(() => {
                                      //   return Usuario.create(
                                      //     objRes.usuario
                                      //   ).then(response => {
                                      //     res({
                                      //       token: objRes.token,
                                      //       usuario: response
                                      //     });
                                      //   });
                                      // })
                                      .then(crearUsuario(objRes, res))
                                      .catch(err => {
                                        console.log(err);
                                      });
                                    // res(objRes);
                                  }
                                  i++;
                                  //creamnos usuario si no existe
                                });
                            })
                            .catch(err => {
                              console.log(err);
                            });
                        }
                      }
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }
            })
            .catch(err => {
              console.log(err);
            });
        }
      }
    );
  });
}

export function authBitbucket(req, res) {
  console.log(req.params.code);
  authenticateBitbucket(req.params.code)
    .then(
      result => {
        res.json(result);
      },
      error => {
        res.send(error);
      }
    )
    .catch(err => {
      console.log(err);
    });
}
