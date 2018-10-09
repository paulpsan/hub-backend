"use strict";

import config from "../../config/environment";
import Gitlab from "gitlab";
import request from "request";
var fs = require('fs');
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

  static create(project) {
    return new Promise((resolve, reject) => {
      let namespace_id
      console.log(project);
      if (project.grupo._id) {
        namespace_id = project.grupo._id
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
            visibility: project.visibilidad,
            import_url: project.origenUrl,
            namespace_id: namespace_id,
            request_access_enabled: true,
            default_branch: "master"
          }
        };
        console.log(options);
        request(options, function (error, response, body) {
          if (error) reject(error);
          if (JSON.parse(body).message) {
            reject(JSON.parse(body));
          }
          console.log(body);
          resolve(body)
        });
      } else {
        var options = {
          method: 'POST',
          url: `${config.repo.gitlab.domain}/api/v4/projects/user/${project.usuario._id}`,
          qs: {
            private_token: config.repo.gitlab.privateToken
          },
          headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
          },
          form: {
            user_id: project.usuario._id,
            name: project.nombre,
            description: project.descripcion,
            visibility: project.visibilidad,
            import_url: project.origenUrl,
          }
        };
        request(options, function (error, response, body) {
          if (error) reject(error);
          if (JSON.parse(body).message) {
            console.log(body);
            reject(JSON.parse(body));
          }
          console.log(JSON.parse(body));
          resolve(body)
        });
      }

    });
  }

  static edit(proyecto) {
    return new Promise((resolve, reject) => {
      let url = `${config.repo.gitlab.domain}/` // Defaults to http://gitlab.com
      let token = config.repo.gitlab.privateToken
      let data = {
        id: proyecto._id,
        visibility: proyecto.visibilidad,
      };
      console.log(data);
      var options = {
        method: 'PUT',
        url: `${url}/api/v4/projects/${data.id}`,
        qs: {
          private_token: token
        },
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded'
        },
        form: {
          id: data.id,
          visibility: data.visibility
        }
      };

      request(options, function (error, response, body) {
        if (error) reject(error);
        if (JSON.parse(body).message) {
          reject(JSON.parse(body));
        }
        resolve(JSON.parse(body))
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      api.Projects.remove(id)
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
  static addLicence(projectId, user) {





    return new Promise((resolve, reject) => {
      var data = data = fs.readFileSync("server/assets/LPGBolivia.pdf");
      let actions = [{
        action: "create",
        encoding: "base64",
        file_path: "licencia.pdf ",
        content: data.toString('base64')
      }]
      let options = {
        // author_email: user.email,
        // author_name: user.nombre
      }

      api.Commits.create(projectId, "master", "adicionando licencia LPGBolivia", actions, options)
        .then(resp => {
          console.log(resp);
          if (resp.length !== 0) {
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