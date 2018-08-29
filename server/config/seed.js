/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

"use strict";
import sqldb from "../sqldb";
import config from "./environment/";
import repositorio from "../models/repositorio";

export default function seedDatabaseIfNeeded() {
  if (config.seedDB) {
    let Rating = sqldb.Rating;
    let ratings;
    let Proyecto = sqldb.Proyecto;
    let proyectos;
    let Usuario = sqldb.Usuario;
    let usuarios;
    let Repositorio = sqldb.Repositorio;
    let repositorios;

    return Rating.destroy({ where: {} }).then(() => {
      return Rating.bulkCreate(
        [
          {
            downloads: 1,
            issues: 1,
            stars: 1,
            forks: 1,
            commits: 1,
            votaciones: 1
          }
        ],
        {
          returning: true
        }
      )
        .then(resultado => {
          ratings = resultado;
          return Usuario.destroy({ where: {} });
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
                login: "",
                tipo: "local",
                avatar: "",
                descripcion: "",
                clasificacion: {
                  datos: [],
                  valor: 1
                },
                datos: "",
                url: ""
              },
              {
                nombre: "2Teodoro Nina2",
                email: "tnina@adsib.gob.bo",
                //con password 123
                password:
                  "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
                role: "admin",
                login: "",
                tipo: "local",
                avatar: "",
                descripcion: "",
                clasificacion: {
                  datos: [],
                  valor: 0
                },
                datos: "",
                url: ""
              },
              {
                nombre: "3Edwin Salcedo3",
                email: "esalcedo@adsib.gob.bo",
                //con password 123
                password:
                  "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
                role: "admin",
                login: "",
                tipo: "local",
                avatar: "",
                descripcion: "",
                clasificacion: {
                  datos: [],
                  valor: 2
                },
                datos: "",
                url: ""
              },
              {
                nombre: "4Jhonny Monrroy4",
                email: "jmonrroy@adsib.gob.bo",
                //con password 123
                password:
                  "$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
                role: "admin",
                login: "",
                tipo: "local",
                avatar: "",
                descripcion: "",
                clasificacion: {
                  datos: [],
                  valor: 1
                },
                datos: "",
                url: ""
              },
            ],
            {
              returning: true
            }
          );
        })
        .then(resultado => {
              usuarios = resultado;
              console.log("Se crearon usuarios de prueba");
              return Repositorio.destroy({ where: {}, cascade: true });
            })
        //     .then(() => {
        //       return Repositorio.bulkCreate(
        //         [
        //           {
        //             nombre: "1D'jalmar Gutierrez1",
        //             email: "dgutierrez@adsib.gob.bo",
        //             fk_usuario: usuarios[0]._id
        //           },
        //           {
        //             nombre: "2Teodoro Nina2",
        //             email: "tnina@adsib.gob.bo",
        //             fk_usuario: usuarios[1]._id
        //           },
        //           {
        //             nombre: "3Edwin Salcedo3",
        //             email: "esalcedo@adsib.gob.bo",
        //             fk_usuario: usuarios[3]._id
        //           }
        //         ],
        //         {
        //           returning: true
        //         }
        //       );
        //     })
        //     .then(resultado => {
        //       repositorios = resultado;
        //       return Proyecto.destroy({ where: {} });
        //     })
        //     .then(() => {
        //       return Proyecto.bulkCreate(
        //         [
        //           {
        //             nombre: "Plantillas formly",
        //             descripcion:
        //               "Usuarios, roles y menús del sistema. Configuración de las plantillas de documentos. Creación de documentos en base a las plantillas configuradas previamente",
        //             urlRepositorio:
        //               "https://gitlab.geo.gob.bo/agetic/plantillas-formly-frontend",
        //             avatar: "",
        //             tipo: "gitlab",
        //             categorias: "",
        //             licencias: "",
        //             clasificacion: "",
        //             usuarios: "",
        //             commits: "",
        //             fechaCreacion: "2018-05-05",
        //             ultimaActividad: "2018-05-05",
        //             datos: "",
        //             fk_usuario: usuarios[0]._id,
        //             fk_repositorio: repositorios[0]._id
        //           },
        //           {
        //             nombre: "veritas-client",
        //             descripcion:
        //               "Sistema de correspondencia de documentos con firma digital",
        //             avatar: "",
        //             urlRepositorio:
        //               "https://gitlab.geo.gob.bo/mmayori/veritas-client",
        //             tipo: "gitlab",
        //             avatar: "",
        //             tipo: "gitlab",
        //             categorias: "",
        //             licencias: "",
        //             clasificacion: "",
        //             usuarios: "",
        //             commits: "",
        //             fechaCreacion: "2018-05-05",
        //             ultimaActividad: "2018-05-05",
        //             datos: "",
        //             fk_usuario: usuarios[1]._id,
        //             fk_repositorio: repositorios[1]._id
        //           },
        //           {
        //             nombre: "catalogo de software",
        //             descripcion: "Publique, revise y comparta proyectos",
        //             avatar: "",
        //             urlRepositorio:
        //               "https://gitlab.geo.gob.bo/psanchez/hub-software-backend",
        //             tipo: "gitlab",
        //             avatar: "",
        //             tipo: "gitlab",
        //             categorias: "",
        //             licencias: "",
        //             clasificacion: "",
        //             usuarios: "",
        //             commits: "",
        //             fechaCreacion: "2018-05-05",
        //             ultimaActividad: "2018-05-05",
        //             datos: "",
        //             fk_usuario: usuarios[2]._id,
        //             fk_repositorio: repositorios[2]._id
        //           }
        //         ],
        //         {
        //           returning: true
        //         }
        //       );
        //     })
        //     .then(resultado => {
        //       proyectos = resultado;
        //       console.log("Se crearon proyectos de prueba");
        //     })
            .catch(err => console.log("error populating things", err));
    });
  }
}
