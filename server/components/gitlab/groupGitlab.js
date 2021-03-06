"use strict";

import Gitlab from "gitlab";
import config from "../../config/environment"
import request from "request";
var fetch = require("node-fetch");

const api = new Gitlab({
  url: `${config.repo.gitlab.domain}/`, // Defaults to http://gitlab.com
  token: config.repo.gitlab.privateToken // Can be created in your profile.
});

function getJson() {
  return function (resultado) {
    return resultado.json();
  };
}
class GroupGitlab {
  static create(grupo) {
    return new Promise((resolve, reject) => {
      let data = {
        name: grupo.nombre,
        path: grupo.path,
        description: grupo.descripcion,
        visibility: grupo.visibilidad,
        request_access_enabled: false
      };
      api.Groups.create(data)
        .then(resp => {
          console.log("grups", resp);
          resolve(resp);
        })
        .catch(err => {
          console.log("****err***", err);
          reject(err);
        });
    });
  }

  static edit(grupo) {
    return new Promise((resolve, reject) => {
      let url = `${config.repo.gitlab.domain}/` // Defaults to http://gitlab.com
      let token = config.repo.gitlab.privateToken
      console.log(grupo);
      let data = {
        id: grupo._id,
        visibility: grupo.visibilidad,
      };
      var options = {
        method: 'PUT',
        url: `${url}/api/v4/groups/${data.id}`,
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
        resolve(body)
      });


      // fetch(`${url}api/v4/groups/${data.id}?private_token=${token}`, {
      //     method: "PUT",
      //     body: data,
      //     headers: {
      //       'Content-Type': 'application/x-www-form-urlencoded'
      //     },
      //   })
      //   .then(getJson())
      //   .then(resp => {
      //     console.log(resp);
      //     resolve(resp)
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     reject(err);
      //   });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      api.Groups.remove(id)
        .then(resp => {
          console.log("grups", resp);
          resolve(resp);
        })
        .catch(err => {
          console.log("****err***", err);
          reject(err);
        });
    });
  }

  static createProject() {
    const url = `${config.repo.gitlab.domain}/api/v4/projects/user/`
    return new Promise((resolver, rechazar) => {
      let data = qs.stringify({
        name: user.nombre,
        username: user.username,
        email: user.email,
        password: user.password,
        skip_confirmation: true
      });
      console.log(`${url}?private_token=${token}`);
      fetch(`${url}?private_token=${token}`, {
          method: "POST",
          body: data
        })
        .then(getJson())
        .then(resp => {
          console.log(resp);
          resolver(resp)
        })
        .catch(err => {
          console.log(err);
          rechazar(err);
        });
    })
  }
}
export default GroupGitlab;