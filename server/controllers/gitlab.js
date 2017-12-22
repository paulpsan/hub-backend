"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
// import { fetch } from "node-fetch";
var fetch = require("node-fetch");

let authenticateGitlab = code => {
  return new Promise((res, rej) => {
    //configuramos los headers
    // var myHeaders = new Headers();
    // myHeaders.append("client_id","becb33a39e525721517c");
    // myHeaders.append("client_secret","36338cdf7057d2086495a241fa3d053766da55c1");
    let headersClient = qs.stringify(
      {
        client_id: "becb33a39e525721517c",
        client_secret: "36338cdf7057d2086495a241fa3d053766da55c1"
      },
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
    fetch("https://gitlab.com/oauth/token", {
      method: "POST",
      body: data
    })
      .then(response => {
        return response.json();
      })
      .then(token => {
        console.log(token);
        //desde aqui
        fetch("https://gitlab.com/api/v4/user?access_token=" + token.access_token)
          .then(res => {
            return res.json();
          })
          .then(json => {
            console.log("user",json)
            let objetoUsuario = {};
            objetoUsuario.nombre = json.name;
            objetoUsuario.email = json.email;
            objetoUsuario.password = "gitlab";
            objetoUsuario.tipo = "gitlab";
            objetoUsuario.role = "usuario";
            objetoUsuario.login = json.login;

            
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
