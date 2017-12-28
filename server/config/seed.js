/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import sqldb from '../sqldb';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if (config.seedDB) {
    //let Thing = sqldb.Thing;
    let Repositorio = sqldb.Repositorio;
    let repositorios;
    let Proyecto = sqldb.Proyecto;
    let proyectos;
    let Usuario = sqldb.Usuario;
    let usuarios;
    let UsuarioRepositorio = sqldb.UsuarioRepositorio;
    let Organizacion = sqldb.Organizacion;
    let organizaciones;

    return Repositorio.destroy({
        where: {}
      })
      .then(() => {
        return Repositorio.bulkCreate([{
          nombre: 'Gitlab GeoBolivia',
          url: 'https://gitlab.geo.gob.bo',
          tipo: 'gitlab'
        }, {
          nombre: 'Gitlab',
          url: 'https://about.gitlab.com',
          tipo: 'gitlab'
        }, {
          nombre: 'GitHub',
          url: 'https://github.com',
          tipo: 'github'
        }], {
          returning: true
        });
      })
      .then(resultado => {
        repositorios = resultado;
        console.log('Se crearon repositorios de prueba');
        return Proyecto.destroy({
          where: {}
        });
      })
      .then(() => {
        return Proyecto.bulkCreate([{
          nombre: 'Gitlab GeoBolivia',
          urlRepositorio: 'https://gitlab.geo.gob.bo',
          descripcion: 'gitlab'
        }, {
          nombre: 'Gitlab',
          urlRepositorio: 'https://about.gitlab.com',
          descripcion: 'gitlab'
        }, {
          nombre: 'GitHub',
          urlRepositorio: 'https://github.com',
          descripcion: 'github'
        }], {
          returning: true
        });
      })
      .then(resultado => {
        proyectos = resultado;
        console.log('Se crearon proyectos de prueba');
        return Usuario.destroy({
          where: {}
        });
      })
      .then(() => {
        return Usuario.bulkCreate([{
          nombre: "D'jalmar Gutierrez",
          email: 'dgutierrez@adsib.gob.bo',
          //con password 123
          password:"$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri", 
          role:"admin",
          tipo:"local",
          login:""
        }, {
          nombre: "Teodoro Nina",
          email: 'tnina@adsib.gob.bo',
          //con password 123
          password:"$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
          role:"admin",
          tipo:"local",
          login:""
        }, {
          nombre: "Edwin Salcedo",
          email: 'esalcedo@adsib.gob.bo',
          //con password 123
          password:"$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
          role:"admin",
          tipo:"local",
          login:""
        }, {
          nombre: "Jhonny Monrroy",
          email: 'jmonrroy@adsib.gob.bo',
          //con password 123
          password:"$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
          role:"admin",
          tipo:"local",
          login:""
        }, {
          nombre: "Andrea Soria",
          email: 'asoria@adsib.gob.bo',
          //con password 123
          password:"$2a$10$Xr1xF.TCidKQlDcsfjU52eKMJNXZFaS9Z7A8i.MjYJioh16HYrrri",
          role:"admin",
          tipo:"local",
          login:""
        }], {
          returning: true
        });
      })
      .then(resultado => {
        usuarios = resultado;
        console.log(('Se crearon usuarios de prueba'));
        return UsuarioRepositorio.destroy({
          where: {}
        });
      })
      .then(() => {
        return UsuarioRepositorio.bulkCreate([{
          email: 'dgutierrez@adsib.gob.bo',
          fk_repositorio: repositorios[0]._id,
          fk_usuario: usuarios[0]._id
        }, {
          email: 'tnina@adsib.gob.bo',
          fk_repositorio: repositorios[0]._id,
          fk_usuario: usuarios[1]._id
        }, {
          email: 'esalcedo@adsib.gob.bo',
          fk_repositorio: repositorios[0]._id,
          fk_usuario: usuarios[2]._id
        }, {
          email: 'jmonrroy@adsib.gob.bo',
          fk_repositorio: repositorios[0]._id,
          fk_usuario: usuarios[3]._id
        }, {
          email: 'asoria@adsib.gob.bo',
          fk_repositorio: repositorios[0]._id,
          fk_usuario: usuarios[4]._id
        }]);
      })
      .then(() => {
        console.log('Se crearon las relaciones entre los usuarios y los repositorios');
        return Organizacion.destroy({
          where: {}
        });
      })
      .then(() => {
        return Organizacion.bulkCreate([{
          nombre: 'ADSIB',
          descripcion: 'Agencia para el Desarrollo de la Sociedad de la Informacion'
        }, {
          nombre: 'AGETIC',
          descripcion: 'Agencia de Gobierno Electronico y Tecnologias de Informacion y Comunicacion'
        }, {
          nombre: 'ADSIB',
          descripcion: 'Agencia para el Desarrollo de la Sociedad de la Informacion'
        }], {
          returning: true
        });
      })
      .then(resultado => {
        organizaciones = resultado;
        console.log('Se crearon las organizaciones de prueba');
      })
      .catch(err => console.log('error populating things', err));
  }
}
