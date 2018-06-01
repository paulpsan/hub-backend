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
    let Proyecto = sqldb.Proyecto;
    let proyectos;
    let Usuario = sqldb.Usuario;
    let usuarios;
    let Repositorio = sqldb.Repositorio;
    let repositorios;

    return Usuario.destroy({
      where: {}
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
              clasificacion: 4,
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
              clasificacion: 4,
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
              clasificacion: 4,
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
              clasificacion: 4,
              datos: "",
              url: ""
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
        return Repositorio.destroy({
          where: {}
        });
      })
      .then(() => {
        return Repositorio.bulkCreate(
          [
            {
              _id: 1,
              nombre: "1D'jalmar Gutierrez1",
              email: "dgutierrez@adsib.gob.bo",
              fk_usuario: 1
            },
            {
              _id: 2,
              nombre: "2Teodoro Nina2",
              email: "tnina@adsib.gob.bo",
              fk_usuario: 2
            },
            {
              _id: 3,
              nombre: "3Edwin Salcedo3",
              email: "esalcedo@adsib.gob.bo",
              fk_usuario: 3
            }
          ],
          {
            returning: true
          }
        );
      })
      .then(resultado => {
        repositorios = resultado;
        return Proyecto.destroy({
          where: {}
        });
      })
      .then(() => {
        return Proyecto.bulkCreate(
          [
            {
              id: 123,
              nombre: "Plantillas formly",
              descripcion:
                "Usuarios, roles y menús del sistema. Configuración de las plantillas de documentos. Creación de documentos en base a las plantillas configuradas previamente",
              urlRepositorio:
                "https://gitlab.geo.gob.bo/agetic/plantillas-formly-frontend",
              avatar: "",
              tipo: "gitlab",
              categorias: "",
              licencias: "",
              clasificacion: "",
              usuarios: "",
              commits: "",
              fechaCreacion: "2018-05-05",
              ultimaActividad: "2018-05-05",
              datos: "",
              fk_repositorio: 3
            },
            {
              id: 1234,
              nombre: "veritas-client",
              descripcion:
                "Sistema de correspondencia de documentos con firma digital",
              avatar: "",
              urlRepositorio:
                "https://gitlab.geo.gob.bo/mmayori/veritas-client",
              tipo: "gitlab",
              avatar: "",
              tipo: "gitlab",
              categorias: "",
              licencias: "",
              clasificacion: "",
              usuarios: "",
              commits: "",
              fechaCreacion: "2018-05-05",
              ultimaActividad: "2018-05-05",
              datos: "",
              fk_repositorio: 2
            },
            {
              id: 12345,
              nombre: "catalogo de software",
              descripcion: "Publique, revise y comparta proyectos",
              avatar: "",
              urlRepositorio:
                "https://gitlab.geo.gob.bo/psanchez/hub-software-backend",
              tipo: "gitlab",
              avatar: "",
              tipo: "gitlab",
              categorias: "",
              licencias: "",
              clasificacion: "",
              usuarios: "",
              commits: "",
              fechaCreacion: "2018-05-05",
              ultimaActividad: "2018-05-05",
              datos: "",
              fk_repositorio: 1
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
      })
      .catch(err => console.log("error populating things", err));
  }
}
