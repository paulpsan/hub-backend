"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
// import { fetch } from "node-fetch";
var fetch = require("node-fetch");

const agent = new https.Agent({
  rejectUnauthorized: false
});

let authenticateGitlab = code => {
  return new Promise((res, rej) => {
    require("ssl-root-cas").inject();
    //configuramos los headers
    // var myHeaders = new Headers();
    // myHeaders.append("client_id","becb33a39e525721517c");
    // myHeaders.append("client_secret","36338cdf7057d2086495a241fa3d053766da55c1");
    let headersClient = qs.stringify(
      {
        client_id:
          "5fd3c547dbc17e2d3f77a0c81a4fae588d3f31007f626a64489814d3900a315d",
        client_secret:
          "f08b68a537601fa7e0aab9d013c4f312d64adfc8d2967a1445cac741229c0a2f"
      },
      // {
      //   client_id: "5fd3c547dbc17e2d3f77a0c81a4fae588d3f31007f626a64489814d3900a315d",
      //   client_secret: "f08b68a537601fa7e0aab9d013c4f312d64adfc8d2967a1445cac741229c0a2f"
      // },
      true
    );
    let data = qs.stringify({
      client_id: config.Gitlab.aplication_id,
      client_secret: config.Gitlab.client_secret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:4200/inicio"
    });

    console.log(data);
    let objRes = {};
    fetch("https://gitlab.geo.gob.bo/oauth/token", {
      // fetch("https://gitlab.com/oauth/token", {
      method: "POST",
      agent,
      strictSSL: false,
      body: data
    })
      .then(response => {
        return response.json();
      })
      .then(token => {
        console.log(token);
        objRes.token = token.access_token;
        //desde aqui
        fetch(
          "https://gitlab.geo.gob.bo/api/v4/user?access_token=" +
            token.access_token,
          { agent, strictSSL: false }
        )
          // fetch("https://gitlab.com/api/v4/user?access_token=" + token.access_token)
          .then(res => {
            return res.json();
          })
          .then(usuarioGitlab => {
            console.log("user", usuarioGitlab);
            let objetoUsuario = {};
            objetoUsuario.nombre = usuarioGitlab.name;
            objetoUsuario.email = usuarioGitlab.email;
            objetoUsuario.password = "gitlab";
            objetoUsuario.tipo = "gitlab";
            objetoUsuario.role = "usuario";
            objetoUsuario.login = usuarioGitlab.username;
            objRes.usuario = objetoUsuario;
            res(objRes);
            fetch(
              "https://gitlab.geo.gob.bo/api/v4/users/" +
                usuarioGitlab.id +
                "/projects",
              { agent, strictSSL: false }
            )
              .then(res => {
                return res.json();
              })
              .then(repositorios => {
                console.log("repos", repositorios);
                let i = 1;
                let objDatos = [];
                if (repositorios.length > 0) {
                  for (let value of repositorios) {
                    let objCommits = {};
                    fetch(
                      "https://gitlab.geo.gob.bo/api/v4/projects/" +
                        value.id +
                        "/repository/commits?access_token=" +
                        token.access_token,
                      { agent, strictSSL: false }
                    )
                      .then(res => {
                        return res.json();
                      })
                      .then(commits => {
                        console.log("commits", commits.length);
                        objDatos.push({
                          repo: value,
                          commits: commits
                        });
                        if (i == repositorios.length) {
                          objetoUsuario.datos = objDatos;
                          objRes.usuario = objetoUsuario;
                          return Usuario.findOrCreate({
                            where: { 
                              email: objRes.usuario.email,
                              tipo:'gitlab'
                            },
                            defaults: objRes.usuario
                          }).spread((user, created) => {
                            console.log(
                              user.get({
                                plain: true
                              })
                            );
                            console.log(created);
                          });
                        }
                        i++;
                      });
                  }
                }
              })
              .catch(err => {
                rej(err);
              });
            // if (json.repos_url) {
            //   fetch(json.repos_url + headersClient)
            //     .then(res => {
            //       return res.json();
            //     })
            //     .then(repositorios => {
            //       // console.log("repos", repositorios);
            //       let i = 1;
            //       let objDatos = [];
            //       if (repositorios.length > 0) {
            //         for (let value of repositorios) {
            //           let objLenguajes = {};
            //           let objCommits = {};
            //           if (value.languages_url) {
            //             fetch(value.languages_url + headersClient)
            //               .then(res => {
            //                 return res.json();
            //               })
            //               .then(lenguajes => {
            //                 objLenguajes = lenguajes;
            //                 // console.log("lenguaje",lenguajes);
            //                 fetch(
            //                   "https://api.github.com/repos/" +
            //                     value.full_name +
            //                     "/commits" +
            //                     headersClient
            //                 )
            //                   .then(res => {
            //                     return res.json();
            //                   })
            //                   .then(commits => {
            //                     objDatos.push({
            //                       lenguajes: objLenguajes,
            //                       repo: value.name,
            //                       commits: commits.length
            //                     });
            //                     console.log("obj", objDatos);
            //                     if (i == repositorios.length) {
            //                       objetoUsuario.datos = objDatos;
            //                       objRes.usuario = objetoUsuario;
            //                       //creamos el objeto si existe
            //                       res(objRes);
            //                     }
            //                     i++;
            //                     //creamnos usuario si no existe
            //                     return Usuario.findOrCreate({
            //                       where: { email: objRes.usuario.email },
            //                       defaults: objRes.usuario
            //                     }).spread((user, created) => {
            //                       console.log(
            //                         user.get({
            //                           plain: true
            //                         })
            //                       );
            //                       console.log(created);
            //                     });
            //                   });
            //               })
            //               .catch(err => {
            //                 console.log(err);
            //               });
            //           }
            //         }
            //       }
            //     })
            //     .catch(err => {
            //       console.log(err);
            //     });
            // }
          })
          .catch(err => {
            rej(err);
            console.log(err);
          });

        //hasta aqui
      })
      .catch(err => {
        console.log(err);
        rej(err);
      });
  });
};

export function authGitlab(req, res) {
  authenticateGitlab(req.params.code)
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
