/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

"use strict";
import sqldb from "../sqldb";
import config from "./environment/";

export default function seedDatabaseIfNeeded() {
  if (config.seedDB) {
    //let Thing = sqldb.Thing;
    let Repositorio = sqldb.Repositorio;
    let repositorios;
    let Commit = sqldb.Commit;
    let commits;
    let Proyecto = sqldb.Proyecto;
    let proyectos;
    let Usuario = sqldb.Usuario;
    let usuarios;
    let UsuarioRepositorio = sqldb.UsuarioRepositorio;

    return Repositorio.destroy({
      where: {}
    })
      .then(() => {
        return Repositorio.bulkCreate(
          [
            {
              nombre: "Gitlab GeoBolivia",
              url: "https://gitlab.geo.gob.bo",
              tipo: "gitlab"
            },
            {
              nombre: "Gitlab",
              url: "https://about.gitlab.com",
              tipo: "gitlab"
            },
            {
              nombre: "GitHub",
              url: "https://github.com",
              tipo: "github"
            }
          ],
          {
            returning: true
          }
        );
      })
      .then(resultado => {
        repositorios = resultado;
        console.log("Se crearon repositorios de prueba");
        return Proyecto.destroy({
          where: {}
        });
      })
      .then(() => {
        return Proyecto.bulkCreate(
          [
            {
              nombre: "Gitlab GeoBolivia",
              urlRepositorio: "https://gitlab.geo.gob.bo",
              descripcion: "gitlab"
            },
            {
              nombre: "Gitlab",
              urlRepositorio: "https://about.gitlab.com",
              descripcion: "gitlab"
            },
            {
              nombre: "GitHub",
              urlRepositorio: "https://github.com",
              descripcion: "github"
            }
          ],
          {
            returning: true
          }
        );
      })
      .then(resultado => {
        proyectos = resultado;
        console.log("Se crearon proyectos de prueba");
        return Usuario.destroy({
          where: {}
        });
      })
      .then(() => {
        return Usuario.bulkCreate(
          [
            {
              nombre: "1D'jalmar Gutierrez1",
              email: "dgutierrez@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 4
            },
            {
              nombre: "2Teodoro Nina2",
              email: "tnina@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "3Edwin Salcedo3",
              email: "esalcedo@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 3
            },
            {
              nombre: "4Jhonny Monrroy4",
              email: "jmonrroy@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "5Teodoro Nina5",
              email: "tnina@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "6Edwin Salcedo6",
              email: "esalcedo@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 3
            },
            {
              nombre: "7Jhonny Monrroy7",
              email: "jmonrroy@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "8Teodoro Nina8",
              email: "tnina@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "9Teodoro Nina9",
              email: "tnina@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "10Edwin Salcedo10",
              email: "esalcedo@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 3
            },
            {
              nombre: "11Jhonny Monrroy11",
              email: "jmonrroy@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "12Teodoro Nina12",
              email: "tnina@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "13Edwin Salcedo13",
              email: "esalcedo@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 3
            },
            {
              nombre: "14Jhonny Monrroy14",
              email: "jmonrroy@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "15Edwin Salcedo15",
              email: "esalcedo@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 3
            },
            {
              nombre: "16Jhonny Monrroy16",
              email: "jmonrroy@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "17Teodoro Nina17",
              email: "tnina@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "18Edwin Salcedo18",
              email: "esalcedo@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 3
            },
            {
              nombre: "19Jhonny Monrroy19",
              email: "jmonrroy@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "20Teodoro Nina20",
              email: "tnina@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "21Edwin Salcedo21",
              email: "esalcedo@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 3
            },
            {
              nombre: "22Jhonny Monrroy",
              email: "jmonrroy@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: ""
            },
            {
              nombre: "23Andrea Soria",
              email: "asoria@adsib.gob.bo",
              //con password 123
              password:
                "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
              role: "admin",
              tipo: "local",
              login: "",
              clasificacion: 2
            }
          ],
          {
            returning: true
          }
        );
      })
      .then(resultado => {
        usuarios = resultado;
        console.log("Se crearon usuarios de prueba");
        return UsuarioRepositorio.destroy({
          where: {}
        });
      })
      .then(() => {
        return UsuarioRepositorio.bulkCreate([
          {
            email: "dgutierrez@adsib.gob.bo",
            fk_repositorio: repositorios[0]._id,
            fk_usuario: usuarios[0]._id
          },
          {
            email: "tnina@adsib.gob.bo",
            fk_repositorio: repositorios[0]._id,
            fk_usuario: usuarios[1]._id
          },
          {
            email: "esalcedo@adsib.gob.bo",
            fk_repositorio: repositorios[0]._id,
            fk_usuario: usuarios[2]._id
          },
          {
            email: "jmonrroy@adsib.gob.bo",
            fk_repositorio: repositorios[0]._id,
            fk_usuario: usuarios[3]._id
          },
          {
            email: "asoria@adsib.gob.bo",
            fk_repositorio: repositorios[0]._id,
            fk_usuario: usuarios[4]._id
          }
        ]);
      })
      .then(() => {
        console.log(
          "Se crearon las relaciones entre los usuarios y los repositorios"
        );
        return Organizacion.destroy({
          where: {}
        });
      })
      .then(() => {
        return Organizacion.bulkCreate(
          [
            {
              nombre: "ADSIB",
              descripcion:
                "Agencia para el Desarrollo de la Sociedad de la Informacion"
            },
            {
              nombre: "AGETIC",
              descripcion:
                "Agencia de Gobierno Electronico y Tecnologias de Informacion y Comunicacion"
            },
            {
              nombre: "ADSIB",
              descripcion:
                "Agencia para el Desarrollo de la Sociedad de la Informacion"
            }
          ],
          {
            returning: true
          }
        );
      })
      .then(resultado => {
        organizaciones = resultado;
        console.log("Se crearon las organizaciones de prueba");
      })
      .catch(err => console.log("error populating things", err));
  }
}
