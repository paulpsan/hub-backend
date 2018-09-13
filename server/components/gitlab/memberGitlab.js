"use strict";

import Gitlab from "gitlab";
import config from "../../config/environment"


const api = new Gitlab({
  url: `${config.repo.gitlab.domain}/`, // Defaults to http://gitlab.com
  token: config.repo.gitlab.privateToken // Can be created in your profile.
});

function addGrupo(object) {
  console.log(object);
  return api.GroupMembers.add(object.id,object.user_id,object.access_level)
    .then(resp => {
      return resp
    })
    .catch(err => {
      return err
    });
}

class MemberGitlab {
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

  static create(id, group) {
    return new Promise((resolve, reject) => {
      let data = {
        userId: project.usuario.usuarioGitlab,
        name: project.nombre,
        description: project.descripcion,
        visibility: "internal",
        import_url: project.origenUrl
      };
      if (isNew) {
        delete data.import_url;
      }
      console.log(data);
      api.Projects.create(data)
        .then(resp => {
          console.log("proy", resp);
          resolve(resp);
        })
        .catch(err => {
          console.log("****err***", err);
          reject(err);
        });
    });
  }

  static addGroup(id, usuarios) {
    return new Promise(async (resolve, reject) => {
      console.log(id, usuarios);
      for (const usuario of usuarios) {
        let obj = {
          user_id: usuario.user_id,
          access_level: usuario.access_level,
          id: id,
        };
        await addGrupo(obj).then(resp => {
          if (resp.error) {
            reject(resp)
          }
        }).catch(err => {
          reject(err)
        });
      }
      resolve(true)
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
export default MemberGitlab;