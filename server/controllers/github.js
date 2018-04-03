"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
// import { fetch } from "node-fetch";
var fetch = require("node-fetch");

let authenticateGithub = code => {
  return new Promise((res, rej) => {
    //configuramos los headers
    // var myHeaders = new Headers();
    // myHeaders.append("client_id","becb33a39e525721517c");
    // myHeaders.append("client_secret","36338cdf7057d2086495a241fa3d053766da55c1");

    let headersClient = qs.stringify(
      {
        client_id: config.github.client_id,
        client_secret: config.github.client_secret
      },
      true
    );
    // console.log(headersClient);
    let data = qs.stringify({
      client_id: config.github.client_id,
      client_secret: config.github.client_secret,
      code: code
    });
    let objRes = {};
    let promesa = fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: data
    });
    promesa
      .then(response => {
        return response.text();
      })
      .then(token => {
        objRes.token = qs.parse(token).access_token;
        // console.log(objRes.token);
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
                                      .then(() => {
                                        return Usuario.create(
                                          objRes.usuario
                                        ).then(response => {
                                          res({
                                            token: objRes.token,
                                            usuario: response
                                          });
                                        });
                                      })
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
      })
      .catch(err => {
        console.log(err);
        rej(err);
      });
  });
};

export function authGithub(req, res) {
  authenticateGithub(req.params.code)
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
