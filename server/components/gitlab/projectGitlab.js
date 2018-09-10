"use strict";

import config from "../../config/environment";
import Gitlab from "gitlab";
var fetch = require("node-fetch");

function getJson() {
  return function(resultado) {
    console.log(resultado);
    return resultado.json();
  };
}

const api = new Gitlab({
  url: `${config.repo.gitlab.domain}/`, // Defaults to http://gitlab.com
  token: config.repo.gitlab.privateToken // Can be created in your profile.
});

class ProjectGitlab {
  static get() {
    return new Promise((resolve, reject) => {
      api.Projects.all()
        .then(user => {
          resolve(user);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static create(project, isNew) {
    return new Promise((resolve, reject) => {
      let data = {
        userId: project.usuario.usuarioGitlab,
        name: project.nombre,
        description: project.descripcion,
        visibility: "internal",
        import_url: project.origenUrl
      };
      if(isNew){
        delete data.import_url;
      }
      console.log(data);
      api.Projects.create(data)
        .then(resp => {
          console.log("proy",resp);
          resolve(resp);
        })
        .catch(err => {
          console.log("****err***",err);
          reject(err);
        });
    });
  }
  //busca email o username y devuelve true si encuentra
  static search(data = "pausl") {
    return new Promise((resolve, reject) => {
      api.Users.search(data)
        .then(user => {
          console.log(user);
          if (user.length !== 0) {
            resolve(true);
          } else {
            reject(false);
          }
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }
}
export default ProjectGitlab;

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}
