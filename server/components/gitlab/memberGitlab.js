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
          access_level: 30,
          id: id,
        };
        console.log(obj);
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
      for (const usuario of usuarios) {
        let obj = {
          user_id: usuario._id,
          access_level: 30,
          id: id,
        };
        await adiProyecto(obj)
          .then(resp => {
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
      console.log(data.access_level);
      return api.GroupMembers.edit(data.fk_grupo, data.fk_usuario, data.access_level)
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
      return api.ProjectMembers.edit(data.fk_proyecto, data.fk_usuario, data.access_level)
        .then(resp => {
          resolve(true)
        })
        .catch(err => {
          reject(err)
        });

    });
  }
  static deleteGroup(id_grupo, id_usuario) {
    return new Promise((resolve, reject) => {
      return api.GroupMembers.remove(id_grupo, id_usuario)
        .then(resp => {
          console.log(resp);
          resolve(true)
        })
        .catch(err => {
          reject(err)
        });
    });
  }
  static deleteProyect(id_usuario, id_proyecto) {
    return new Promise((resolve, reject) => {
      return api.ProjectMembers.remove(id_proyecto, id_usuario)
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