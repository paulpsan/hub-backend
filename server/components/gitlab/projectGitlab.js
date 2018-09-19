"use strict";

import config from "../../config/environment";
import Gitlab from "gitlab";
import request from "request";
var fetch = require("node-fetch");

function getJson() {
  return function (resultado) {
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
      let namespace_id
      console.log(project);
      if (project.grupo.id_gitlab) {
        namespace_id = project.grupo.id_gitlab
        var options = {
          method: 'POST',
          url: `${config.repo.gitlab.domain}/api/v4/projects`,
          qs: {
            private_token: config.repo.gitlab.privateToken
          },
          headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
          },
          form: {
            path: project.nombre,
            name: project.nombre,
            description: project.descripcion,
            visibility: "private",
            import_url: project.origenUrl,
            namespace_id: namespace_id
          }
        };

        request(options, function (error, response, body) {
          console.log(body);
          resolve(body);
          if (error) reject(error);
        });
      } else {
        var options = {
          method: 'POST',
          url: `${config.repo.gitlab.domain}/api/v4/projects/user/${project.usuario.usuarioGitlab}`,
          qs: {
            private_token: config.repo.gitlab.privateToken
          },
          headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
          },
          form: {
            user_id: project.usuario.usuarioGitlab,
            name: project.nombre,
            description: project.descripcion,
            visibility: "private",
            import_url: project.origenUrl,
          }
        };
        request(options, function (error, response, body) {
          console.log(body);
          resolve(body);
          if (error) reject(error);
        });
      }

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
  return function (resultado) {
    return resultado.json();
  };
}