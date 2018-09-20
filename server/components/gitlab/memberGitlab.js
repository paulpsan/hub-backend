"use strict";

import Gitlab from "gitlab";
import config from "../../config/environment"


const api = new Gitlab({
  url: `${config.repo.gitlab.domain}/`, // Defaults to http://gitlab.com
  token: config.repo.gitlab.privateToken // Can be created in your profile.
});

function addGrupo(object) {
  console.log(object);
  return api.GroupMembers.add(object.id, object.user_id, object.access_level)
    .then(resp => {
      return resp
    })
    .catch(err => {
      return err
    });
}

function adiProyecto(object) {
  console.log(object);
  return api.ProjectMembers.add(object.id, object.user_id, object.access_level)
    .then(resp => {
      console.log(resp);
      return resp
    })
    .catch(err => {
      console.log(err);
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

  static addProject(id, usuarios) {
    return new Promise(async (resolve, reject) => {
      console.log(id, usuarios);
      for (const usuario of usuarios) {
        let obj = {
          user_id: usuario.usuarioGitlab,
          access_level: 40,
          id: id,
        };
        obj.access_level = usuario.access_level ? usuario.access_level : 40;
        await adiProyecto(obj).then(resp => {
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

  static editGroup(data) {
    return new Promise(async (resolve, reject) => {
      return api.GroupMembers.edit(data.grupoGitlab, data.usuarioGitlab, data.access_level)
        .then(resp => {
          resolve(true)
        })
        .catch(err => {
          reject(err)
        });

    });
  }
  static editProject(data) {
    return new Promise(async (resolve, reject) => {
      return api.ProjectMembers.edit(data.proyectoGitlab, data.usuarioGitlab, data.access_level)
        .then(resp => {
          resolve(true)
        })
        .catch(err => {
          reject(err)
        });

    });
  }
  static deleteGroup(data) {
    return new Promise((resolve, reject) => {
      return api.GroupMembers.remove(data.grupoGitlab, data.usuarioGitlab)
        .then(resp => {
          console.log(resp);
          resolve(true)
        })
        .catch(err => {
          reject(err)
        });
    });
  }
  static deleteProyect(data) {
    return new Promise((resolve, reject) => {
      return api.ProjectMembers.remove(data.proyectoGitlab, data.usuarioGitlab)
        .then(resp => {
          console.log(resp);
          resolve(true)
        })
        .catch(err => {
          reject(err)
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
export default MemberGitlab;